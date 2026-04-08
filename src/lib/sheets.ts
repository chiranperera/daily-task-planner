import type { GroceryItem } from '@/types';

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
  return data.items;
}

export async function addItemToSheet(item: Omit<GroceryItem, 'id'>): Promise<GroceryItem> {
  const data = await callSheet('add', { item }) as { item: GroceryItem };
  return data.item;
}

export async function updateItemInSheet(item: GroceryItem): Promise<void> {
  await callSheet('update', { item });
}

export async function deleteItemFromSheet(id: string): Promise<void> {
  await callSheet('delete', { id });
}

export async function syncToSheet(items: GroceryItem[]): Promise<void> {
  await callSheet('syncAll', { items });
}
