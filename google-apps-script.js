/**
 * Google Apps Script — Deploy this as a Web App linked to your Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. IMPORTANT: First, manually delete the "ID" text that may have been
 *    written to Row 1 by a previous version of this script.
 *    Clear any cells in Row 1 that contain "ID", "Item", "Category" etc.
 *    that don't belong to your original sheet layout.
 * 2. Open your Google Sheet
 * 3. Go to Extensions → Apps Script
 * 4. Delete any existing code, paste this entire file
 * 5. Click "Deploy" → "Manage deployments" → edit existing → "New version"
 *    OR "Deploy" → "New deployment" → Web app
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste the URL into the Grocery Tracker app Settings page
 *
 * This script auto-detects your header row by searching for a row where
 * "Item" appears as the FIRST column. It skips title rows, summary rows,
 * and any injected header rows from previous script versions.
 */

// Expected column headers in the user's sheet → internal field names
var COLUMN_MAP = {
  'Item': 'name',
  'Category': 'category',
  'Storage': 'storage',
  'Qty On Hand': 'qtyOnHand',
  'Unit': 'unit',
  'Min Level': 'minLevel',
  'Restock To': 'restockTo',
  'Last Updated': 'lastUpdated',
  'Notes': 'notes'
};

var EXPECTED_HEADERS = ['Item', 'Category', 'Storage', 'Qty On Hand', 'Unit', 'Min Level', 'Restock To'];

function findHeaders(sheet) {
  var lastRow = Math.min(sheet.getLastRow(), 25);
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return null;

  var allRows = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  var bestMatch = null;
  var bestScore = 0;

  for (var r = 0; r < allRows.length; r++) {
    var row = allRows[r];
    var score = 0;
    var itemCol = -1;

    for (var c = 0; c < row.length; c++) {
      var val = String(row[c]).trim();
      if (val === 'Item') itemCol = c;
      for (var h = 0; h < EXPECTED_HEADERS.length; h++) {
        if (val === EXPECTED_HEADERS[h]) {
          score++;
          break;
        }
      }
    }

    // Must have "Item" column and at least 5 matching headers
    if (itemCol === -1 || score < 5) continue;

    // CRITICAL: Skip rows where "ID" appears before "Item" column
    // This catches the injected header row from old script versions
    var hasIdBefore = false;
    for (var ci = 0; ci < itemCol; ci++) {
      if (String(row[ci]).trim().toUpperCase() === 'ID') {
        hasIdBefore = true;
        break;
      }
    }
    if (hasIdBefore) continue;

    // Prefer: highest score, then "Item" in earliest column
    if (score > bestScore || (score === bestScore && bestMatch && itemCol < bestMatch.itemCol)) {
      bestScore = score;
      bestMatch = { rowIndex: r, itemCol: itemCol, row: row };
    }
  }

  if (!bestMatch) return null;

  // Build column index map: internal field name → column index
  var colMap = {};
  for (var ci2 = 0; ci2 < bestMatch.row.length; ci2++) {
    var header = String(bestMatch.row[ci2]).trim();
    if (COLUMN_MAP[header]) {
      colMap[COLUMN_MAP[header]] = ci2;
    }
  }

  return { headerRow: bestMatch.rowIndex + 1, colMap: colMap, totalCols: lastCol };
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var names = ['Inventory', 'Sheet1', 'Data'];
  var sheet = null;
  for (var i = 0; i < names.length; i++) {
    sheet = ss.getSheetByName(names[i]);
    if (sheet) break;
  }
  if (!sheet) sheet = ss.getSheets()[0];
  return sheet;
}

function formatDate(d) {
  try {
    if (!d) return '';
    var date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch (e) {
    return String(d || '');
  }
}

function rowToItem(row, colMap, sheetRowNum) {
  return {
    id: 'row-' + sheetRowNum,
    name: colMap.name !== undefined ? String(row[colMap.name] || '') : '',
    category: colMap.category !== undefined ? String(row[colMap.category] || '') : '',
    storage: colMap.storage !== undefined ? String(row[colMap.storage] || '') : '',
    qtyOnHand: colMap.qtyOnHand !== undefined ? (Number(row[colMap.qtyOnHand]) || 0) : 0,
    unit: colMap.unit !== undefined ? String(row[colMap.unit] || 'pcs') : 'pcs',
    minLevel: colMap.minLevel !== undefined ? (Number(row[colMap.minLevel]) || 0) : 0,
    restockTo: colMap.restockTo !== undefined ? (Number(row[colMap.restockTo]) || 0) : 0,
    lastUpdated: colMap.lastUpdated !== undefined ? formatDate(row[colMap.lastUpdated]) : '',
    notes: colMap.notes !== undefined ? String(row[colMap.notes] || '') : ''
  };
}

function getAllItems() {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return [];

  var dataStartRow = info.headerRow + 1;
  var lastRow = sheet.getLastRow();
  if (lastRow < dataStartRow) return [];

  var data = sheet.getRange(dataStartRow, 1, lastRow - dataStartRow + 1, info.totalCols).getValues();
  var items = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var itemName = colMap_get(info.colMap, 'name', row);
    if (!itemName) continue;
    items.push(rowToItem(row, info.colMap, dataStartRow + i));
  }
  return items;
}

function colMap_get(colMap, field, row) {
  if (colMap[field] === undefined) return '';
  return String(row[colMap[field]] || '').trim();
}

function writeItemToRow(sheet, info, rowNum, item) {
  var colMap = info.colMap;
  var currentRow = sheet.getRange(rowNum, 1, 1, info.totalCols).getValues()[0];

  if (colMap.name !== undefined) currentRow[colMap.name] = item.name || '';
  if (colMap.category !== undefined) currentRow[colMap.category] = item.category || '';
  if (colMap.storage !== undefined) currentRow[colMap.storage] = item.storage || '';
  if (colMap.qtyOnHand !== undefined) currentRow[colMap.qtyOnHand] = Number(item.qtyOnHand) || 0;
  if (colMap.unit !== undefined) currentRow[colMap.unit] = item.unit || 'pcs';
  if (colMap.minLevel !== undefined) currentRow[colMap.minLevel] = Number(item.minLevel) || 0;
  if (colMap.restockTo !== undefined) currentRow[colMap.restockTo] = Number(item.restockTo) || 0;
  if (colMap.lastUpdated !== undefined) currentRow[colMap.lastUpdated] = formatDate(new Date());
  if (colMap.notes !== undefined) currentRow[colMap.notes] = item.notes || '';

  sheet.getRange(rowNum, 1, 1, info.totalCols).setValues([currentRow]);
}

function addItem(item) {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return null;

  // Build a new row with values in the correct columns
  var newRow = [];
  for (var c = 0; c < info.totalCols; c++) {
    newRow.push('');
  }

  var colMap = info.colMap;
  if (colMap.name !== undefined) newRow[colMap.name] = item.name || '';
  if (colMap.category !== undefined) newRow[colMap.category] = item.category || '';
  if (colMap.storage !== undefined) newRow[colMap.storage] = item.storage || '';
  if (colMap.qtyOnHand !== undefined) newRow[colMap.qtyOnHand] = Number(item.qtyOnHand) || 0;
  if (colMap.unit !== undefined) newRow[colMap.unit] = item.unit || 'pcs';
  if (colMap.minLevel !== undefined) newRow[colMap.minLevel] = Number(item.minLevel) || 0;
  if (colMap.restockTo !== undefined) newRow[colMap.restockTo] = Number(item.restockTo) || 0;
  if (colMap.lastUpdated !== undefined) newRow[colMap.lastUpdated] = formatDate(new Date());
  if (colMap.notes !== undefined) newRow[colMap.notes] = item.notes || '';

  sheet.appendRow(newRow);
  var lastRow = sheet.getLastRow();

  return {
    id: 'row-' + lastRow,
    name: item.name || '',
    category: item.category || '',
    storage: item.storage || '',
    qtyOnHand: Number(item.qtyOnHand) || 0,
    unit: item.unit || 'pcs',
    minLevel: Number(item.minLevel) || 0,
    restockTo: Number(item.restockTo) || 0,
    lastUpdated: formatDate(new Date()),
    notes: item.notes || ''
  };
}

function findItemRow(sheet, info, id) {
  var dataStartRow = info.headerRow + 1;
  var lastRow = sheet.getLastRow();
  if (lastRow < dataStartRow) return -1;

  // Try row-N format first
  var match = String(id).match(/^row-(\d+)$/);
  if (match) {
    var rowNum = parseInt(match[1]);
    if (rowNum >= dataStartRow && rowNum <= lastRow) return rowNum;
  }

  // Fallback: search by item name
  if (info.colMap.name === undefined) return -1;
  var nameColIdx = info.colMap.name + 1; // 1-based for getRange
  var names = sheet.getRange(dataStartRow, nameColIdx, lastRow - dataStartRow + 1, 1).getValues().flat();

  for (var i = 0; i < names.length; i++) {
    if (String(names[i]).trim().toLowerCase() === String(id).trim().toLowerCase()) {
      return dataStartRow + i;
    }
  }
  return -1;
}

function updateItem(item) {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return;

  var rowNum = findItemRow(sheet, info, item.id);
  if (rowNum === -1) {
    // Try finding by name as fallback
    if (info.colMap.name !== undefined && item.name) {
      var dataStartRow = info.headerRow + 1;
      var lastRow = sheet.getLastRow();
      if (lastRow >= dataStartRow) {
        var names = sheet.getRange(dataStartRow, info.colMap.name + 1, lastRow - dataStartRow + 1, 1).getValues().flat();
        for (var i = 0; i < names.length; i++) {
          if (String(names[i]).trim() === item.name.trim()) {
            rowNum = dataStartRow + i;
            break;
          }
        }
      }
    }
    if (rowNum === -1) return;
  }
  writeItemToRow(sheet, info, rowNum, item);
}

function deleteItem(id) {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return;

  var rowNum = findItemRow(sheet, info, id);
  if (rowNum === -1) return;
  sheet.deleteRow(rowNum);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var result;

    switch (body.action) {
      case 'getAll':
        result = { items: getAllItems() };
        break;
      case 'add':
        result = { item: addItem(body.item) };
        break;
      case 'update':
        updateItem(body.item);
        result = { success: true };
        break;
      case 'delete':
        deleteItem(body.id);
        result = { success: true };
        break;
      default:
        result = { error: 'Unknown action: ' + body.action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message, stack: err.stack }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    var items = getAllItems();
    return ContentService.createTextOutput(JSON.stringify({ items: items, count: items.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
