import type { GroceryItem } from '../types';
import { SEED_DATA } from '../data/seedData';

const STORAGE_KEY = 'grocery-inventory-items';

export function loadItems(): GroceryItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...SEED_DATA];
  try {
    const items = JSON.parse(raw) as GroceryItem[];
    return items.length > 0 ? items : [...SEED_DATA];
  } catch {
    return [...SEED_DATA];
  }
}

export function saveItems(items: GroceryItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
