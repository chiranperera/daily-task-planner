export type Category =
  | 'Grains & Staples'
  | 'Breakfast'
  | 'Dinner'
  | 'Produce'
  | 'Cooking Essentials';

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
];

export const STORAGE_LOCATIONS: StorageLocation[] = ['Storage', 'Pantry'];

export const UNITS: Unit[] = ['pcs', 'bottles', 'kg', 'packs'];

export const STATUSES: ItemStatus[] = ['LOW STOCK', 'WATCH', 'OK'];
