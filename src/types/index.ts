export type Category =
  | 'Grains & Staples'
  | 'Breakfast'
  | 'Dinner'
  | 'Produce'
  | 'Cooking Essentials'
  | 'Dairy'
  | 'Frozen'
  | 'Snacks'
  | 'Kids'
  | 'Beverages'
  | 'Spices & Condiments'
  | 'Baking & Cooking';

export type StorageLocation = 'Storage' | 'Pantry';

export type Unit = 'pcs' | 'bottles' | 'kg' | 'packs';

export type ItemStatus = 'LOW STOCK' | 'WATCH' | 'OK';

export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  storage: StorageLocation;
  qtyOnHand: number;
  unit: Unit;
  minLevel: number;
  restockTo: number;
  lastUpdated: string;
  notes: string;
  order?: number;
}

export interface GroceryItemWithStatus extends GroceryItem {
  status: ItemStatus;
  needToBuy: number;
}

export interface DashboardStats {
  trackedItems: number;
  lowStockCount: number;
  watchCount: number;
  unitsToBuy: number;
  okCount: number;
}

export interface InventoryFilters {
  search: string;
  category: Category | 'All';
  storage: StorageLocation | 'All';
  status: ItemStatus | 'All';
}

export const CATEGORIES: Category[] = [
  'Grains & Staples',
  'Breakfast',
  'Dinner',
  'Produce',
  'Cooking Essentials',
  'Dairy',
  'Frozen',
  'Snacks',
  'Kids',
  'Beverages',
  'Spices & Condiments',
  'Baking & Cooking',
];

// Normalize category values coming from the sheet (handles legacy/truncated labels).
const CATEGORY_ALIASES: Record<string, Category> = {
  'cooking essens': 'Cooking Essentials',
  'cooking essen': 'Cooking Essentials',
  'spices': 'Spices & Condiments',
  'condiments': 'Spices & Condiments',
  'baking': 'Baking & Cooking',
};

export function normalizeCategory(raw: string): Category {
  const trimmed = (raw || '').trim();
  if (!trimmed) return 'Cooking Essentials';
  // Exact match against known categories
  const exact = CATEGORIES.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  // Alias lookup
  const alias = CATEGORY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  // Unknown → default bucket so the UI never crashes on a stray string
  return 'Cooking Essentials';
}

export const STORAGE_LOCATIONS: StorageLocation[] = ['Storage', 'Pantry'];

export const UNITS: Unit[] = ['pcs', 'bottles', 'kg', 'packs'];

export const STATUSES: ItemStatus[] = ['LOW STOCK', 'WATCH', 'OK'];

export interface ShoppingListItem {
  id: string;
  name: string;
  category: Category;
  storage: StorageLocation;
  qty: number;
  unit: Unit;
  notes: string;
  checked: boolean;
  createdAt: string;
  inventoryItemId?: string;  // if linked to an existing inventory item
  isNewProduct?: boolean;     // true if this is a brand new product
}
