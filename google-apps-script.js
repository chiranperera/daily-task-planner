/**
 * Google Apps Script — Deploy this as a Web App linked to your Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code, paste this entire file
 * 4. Click "Deploy" → "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste the URL into the Grocery Tracker app Settings page
 *
 * This script auto-detects your header row by searching for "Item" column.
 * It works with sheets that have title/summary rows above the data.
 * Computed columns (Status, Need to Buy) are skipped — the app calculates those.
 */

// Column names we read/write (order doesn't matter — matched by header name)
const COLUMN_MAP = {
  'Item': 'name',
  'Category': 'category',
  'Storage': 'storage',
  'Qty On Hand': 'qtyOnHand',
  'Unit': 'unit',
  'Min Level': 'minLevel',
  'Restock To': 'restockTo',
  'Last Updated': 'lastUpdated',
  'Notes': 'notes',
};

// Cache for header row info
var _headerCache = null;

function findHeaders(sheet) {
  if (_headerCache) return _headerCache;

  var lastRow = Math.min(sheet.getLastRow(), 20); // only scan first 20 rows
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return null;

  var allRows = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  for (var r = 0; r < allRows.length; r++) {
    var row = allRows[r];
    for (var c = 0; c < row.length; c++) {
      var val = String(row[c]).trim();
      if (val === 'Item') {
        // Found the header row — build column index map
        var colMap = {};
        for (var ci = 0; ci < row.length; ci++) {
          var header = String(row[ci]).trim();
          if (COLUMN_MAP[header]) {
            colMap[COLUMN_MAP[header]] = ci; // e.g. { name: 0, category: 1, ... }
          }
        }
        _headerCache = { headerRow: r + 1, colMap: colMap, totalCols: lastCol };
        return _headerCache;
      }
    }
  }
  return null;
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Try common sheet names
  var names = ['Inventory', 'Sheet1', 'Data'];
  var sheet = null;
  for (var i = 0; i < names.length; i++) {
    sheet = ss.getSheetByName(names[i]);
    if (sheet) break;
  }
  if (!sheet) sheet = ss.getSheets()[0];
  return sheet;
}

function rowToItem(row, colMap, rowIndex) {
  var name = colMap.name !== undefined ? String(row[colMap.name] || '') : '';
  var category = colMap.category !== undefined ? String(row[colMap.category] || '') : '';
  var storage = colMap.storage !== undefined ? String(row[colMap.storage] || '') : '';
  var qtyOnHand = colMap.qtyOnHand !== undefined ? Number(row[colMap.qtyOnHand]) || 0 : 0;
  var unit = colMap.unit !== undefined ? String(row[colMap.unit] || 'pcs') : 'pcs';
  var minLevel = colMap.minLevel !== undefined ? Number(row[colMap.minLevel]) || 0 : 0;
  var restockTo = colMap.restockTo !== undefined ? Number(row[colMap.restockTo]) || 0 : 0;
  var notes = colMap.notes !== undefined ? String(row[colMap.notes] || '') : '';

  var lastUpdated = '';
  if (colMap.lastUpdated !== undefined && row[colMap.lastUpdated]) {
    try {
      var d = new Date(row[colMap.lastUpdated]);
      if (!isNaN(d.getTime())) {
        lastUpdated = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
    } catch (e) {
      lastUpdated = String(row[colMap.lastUpdated]);
    }
  }

  // Generate a stable ID from row index (no ID column in user's sheet)
  var id = 'row-' + rowIndex;

  return {
    id: id,
    name: name,
    category: category,
    storage: storage,
    qtyOnHand: qtyOnHand,
    unit: unit,
    minLevel: minLevel,
    restockTo: restockTo,
    lastUpdated: lastUpdated,
    notes: notes,
  };
}

function getAllItems() {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return [];

  var dataStartRow = info.headerRow + 1;
  var lastRow = sheet.getLastRow();
  if (lastRow < dataStartRow) return [];

  var numRows = lastRow - dataStartRow + 1;
  var data = sheet.getRange(dataStartRow, 1, numRows, info.totalCols).getValues();

  var items = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    // Skip empty rows (check Item column)
    var itemName = info.colMap.name !== undefined ? String(row[info.colMap.name] || '').trim() : '';
    if (!itemName) continue;
    items.push(rowToItem(row, info.colMap, dataStartRow + i));
  }
  return items;
}

function findItemRow(sheet, info, id) {
  // id format: "row-N" where N is the sheet row number
  var match = String(id).match(/^row-(\d+)$/);
  if (match) {
    var rowNum = parseInt(match[1]);
    if (rowNum >= info.headerRow + 1 && rowNum <= sheet.getLastRow()) {
      return rowNum;
    }
  }

  // Fallback: search by item name (for items added by the app)
  var dataStartRow = info.headerRow + 1;
  var lastRow = sheet.getLastRow();
  if (lastRow < dataStartRow) return -1;

  var nameCol = info.colMap.name;
  if (nameCol === undefined) return -1;

  var names = sheet.getRange(dataStartRow, nameCol + 1, lastRow - dataStartRow + 1, 1).getValues().flat();
  // Try to match by a stored name in the ID (for app-created items)
  for (var i = 0; i < names.length; i++) {
    if (String(id) === 'row-' + (dataStartRow + i)) return dataStartRow + i;
  }
  return -1;
}

function writeItemToRow(sheet, info, rowNum, item) {
  var colMap = info.colMap;
  // Read current row to preserve any columns we don't manage
  var currentRow = sheet.getRange(rowNum, 1, 1, info.totalCols).getValues()[0];

  if (colMap.name !== undefined) currentRow[colMap.name] = item.name;
  if (colMap.category !== undefined) currentRow[colMap.category] = item.category;
  if (colMap.storage !== undefined) currentRow[colMap.storage] = item.storage;
  if (colMap.qtyOnHand !== undefined) currentRow[colMap.qtyOnHand] = item.qtyOnHand;
  if (colMap.unit !== undefined) currentRow[colMap.unit] = item.unit;
  if (colMap.minLevel !== undefined) currentRow[colMap.minLevel] = item.minLevel;
  if (colMap.restockTo !== undefined) currentRow[colMap.restockTo] = item.restockTo;
  if (colMap.lastUpdated !== undefined) currentRow[colMap.lastUpdated] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (colMap.notes !== undefined) currentRow[colMap.notes] = item.notes || '';

  sheet.getRange(rowNum, 1, 1, info.totalCols).setValues([currentRow]);
}

function addItem(item) {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return null;

  var newRow = new Array(info.totalCols).fill('');
  var colMap = info.colMap;

  if (colMap.name !== undefined) newRow[colMap.name] = item.name;
  if (colMap.category !== undefined) newRow[colMap.category] = item.category;
  if (colMap.storage !== undefined) newRow[colMap.storage] = item.storage;
  if (colMap.qtyOnHand !== undefined) newRow[colMap.qtyOnHand] = item.qtyOnHand;
  if (colMap.unit !== undefined) newRow[colMap.unit] = item.unit;
  if (colMap.minLevel !== undefined) newRow[colMap.minLevel] = item.minLevel;
  if (colMap.restockTo !== undefined) newRow[colMap.restockTo] = item.restockTo;
  if (colMap.lastUpdated !== undefined) newRow[colMap.lastUpdated] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (colMap.notes !== undefined) newRow[colMap.notes] = item.notes || '';

  sheet.appendRow(newRow);
  var lastRow = sheet.getLastRow();

  return {
    id: 'row-' + lastRow,
    name: item.name,
    category: item.category,
    storage: item.storage,
    qtyOnHand: item.qtyOnHand,
    unit: item.unit || 'pcs',
    minLevel: item.minLevel,
    restockTo: item.restockTo,
    lastUpdated: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    notes: item.notes || '',
  };
}

function updateItem(item) {
  var sheet = getSheet();
  var info = findHeaders(sheet);
  if (!info) return;

  var rowNum = findItemRow(sheet, info, item.id);
  if (rowNum === -1) return;

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
    _headerCache = null; // clear cache per request
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
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  try {
    _headerCache = null;
    var items = getAllItems();
    return ContentService.createTextOutput(JSON.stringify({ items: items, count: items.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
