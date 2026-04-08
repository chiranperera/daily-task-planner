/**
 * Google Apps Script — Deploy this as a Web App linked to your Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1LDeUkFl6SYafQ5K7hhbeFA6M7D7UekescBRGCoSn8bg
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code, paste this entire file
 * 4. Click "Deploy" → "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": "Me"
 * 7. Set "Who has access": "Anyone"
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste the URL into the Grocery Tracker app Settings page
 *
 * SHEET FORMAT (Row 1 = headers):
 * A: ID | B: Item | C: Category | D: Storage | E: Qty On Hand | F: Unit | G: Min Level | H: Restock To | I: Last Updated | J: Notes
 */

const SHEET_NAME = 'Inventory'; // Change if your sheet tab has a different name
const HEADERS = ['ID', 'Item', 'Category', 'Storage', 'Qty On Hand', 'Unit', 'Min Level', 'Restock To', 'Last Updated', 'Notes'];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0]; // fallback to first sheet
  }
  // Ensure headers exist
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow[0] !== 'ID') {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function rowToItem(row) {
  return {
    id: String(row[0]),
    name: String(row[1]),
    category: String(row[2]),
    storage: String(row[3]),
    qtyOnHand: Number(row[4]) || 0,
    unit: String(row[5]),
    minLevel: Number(row[6]) || 0,
    restockTo: Number(row[7]) || 0,
    lastUpdated: row[8] ? Utilities.formatDate(new Date(row[8]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
    notes: String(row[9] || ''),
  };
}

function itemToRow(item) {
  return [
    item.id,
    item.name,
    item.category,
    item.storage,
    item.qtyOnHand,
    item.unit,
    item.minLevel,
    item.restockTo,
    item.lastUpdated,
    item.notes || '',
  ];
}

function getAllItems() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return data.filter(row => row[0] && row[1]).map(rowToItem);
}

function addItem(item) {
  const sheet = getSheet();
  const id = Utilities.getUuid();
  const newItem = { ...item, id: id, lastUpdated: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') };
  sheet.appendRow(itemToRow(newItem));
  return newItem;
}

function updateItem(item) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const rowIndex = ids.indexOf(item.id);
  if (rowIndex === -1) return;
  item.lastUpdated = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  sheet.getRange(rowIndex + 2, 1, 1, HEADERS.length).setValues([itemToRow(item)]);
}

function deleteItem(id) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const rowIndex = ids.indexOf(id);
  if (rowIndex === -1) return;
  sheet.deleteRow(rowIndex + 2);
}

function syncAll(items) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  // Clear existing data (keep headers)
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clear();
  }
  // Write all items
  if (items.length > 0) {
    const rows = items.map(itemToRow);
    sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  }
}

// Handle POST requests from the web app
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    let result;

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
      case 'syncAll':
        syncAll(body.items);
        result = { success: true };
        break;
      default:
        result = { error: 'Unknown action' };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet() {
  try {
    const items = getAllItems();
    return ContentService.createTextOutput(JSON.stringify({ items: items, count: items.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
