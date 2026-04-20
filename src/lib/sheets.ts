import type { GroceryItem } from '@/types';
import { normalizeCategory } from '@/types';

const SCRIPT_URL_KEY = 'grocery-tracker-script-url';

export function getScriptUrl(): string | null {
  return localStorage.getItem(SCRIPT_URL_KEY);
}

export function setScriptUrl(url: string): void {
  localStorage.setItem(SCRIPT_URL_KEY, url);
}

export function clearScriptUrl(): void {
  localStorage.removeItem(SCRIPT_URL_KEY);
}

export function isGoogleSheetsConnected(): boolean {
  return !!getScriptUrl();
}

type SheetItem = Omit<GroceryItem, 'id' | 'order'>;

// Strip fields that shouldn't be sent to the sheet
function toSheetItem(item: GroceryItem | Omit<GroceryItem, 'id'>): SheetItem {
  return {
    name: item.name,
    category: item.category,
    storage: item.storage,
    qtyOnHand: item.qtyOnHand,
    unit: item.unit,
    minLevel: item.minLevel,
    restockTo: item.restockTo,
    lastUpdated: item.lastUpdated,
    notes: item.notes || '',
  };
}

async function callSheet(action: string, payload?: Record<string, unknown>): Promise<unknown> {
  const url = getScriptUrl();
  if (!url) throw new Error('Google Sheets not connected');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!res.ok) throw new Error(`Sheet API error: ${res.status}`);
  return res.json();
}

export async function fetchAllItems(): Promise<GroceryItem[]> {
  const data = await callSheet('getAll') as { items: GroceryItem[] };
  // Normalize category values so the app's strict Category union holds.
  return (data.items || []).map((raw) => ({
    ...raw,
    category: normalizeCategory(raw.category as unknown as string),
  }));
}

export async function addItemToSheet(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  // Only send sheet-relevant fields (no id, no status, no needToBuy)
  const data = await callSheet('add', { item: toSheetItem(item) }) as { item: GroceryItem };
  return data.item;
}

export async function updateItemInSheet(item: GroceryItem): Promise<void> {
  // Send id for row lookup + clean sheet fields
  await callSheet('update', { item: { id: item.id, ...toSheetItem(item) } });
}

export async function deleteItemFromSheet(id: string): Promise<void> {
  await callSheet('delete', { id });
}
