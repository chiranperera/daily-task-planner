import type { GroceryItem, GroceryItemWithStatus, ItemStatus, DashboardStats, InventoryFilters } from '../types';

export function computeStatus(item: GroceryItem): ItemStatus {
  if (item.qtyOnHand <= item.minLevel) return 'LOW STOCK';
  if (item.qtyOnHand < item.restockTo) return 'WATCH';
  return 'OK';
}

export function computeNeedToBuy(item: GroceryItem): number {
  return Math.max(0, item.restockTo - item.qtyOnHand);
}

export function withStatus(item: GroceryItem): GroceryItemWithStatus {
  return {
    ...item,
    status: computeStatus(item),
    needToBuy: computeNeedToBuy(item),
  };
}

export function computeStats(items: GroceryItemWithStatus[]): DashboardStats {
  return {
    trackedItems: items.length,
    lowStockCount: items.filter((i) => i.status === 'LOW STOCK').length,
    watchCount: items.filter((i) => i.status === 'WATCH').length,
    unitsToBuy: items
      .filter((i) => i.status === 'LOW STOCK')
      .reduce((sum, i) => sum + i.needToBuy, 0),
    okCount: items.filter((i) => i.status === 'OK').length,
  };
}

export function generateShoppingList(items: GroceryItemWithStatus[]): GroceryItemWithStatus[] {
  return items
    .filter((i) => i.status === 'LOW STOCK' && i.needToBuy > 0)
    .sort((a, b) => b.needToBuy - a.needToBuy);
}

export function filterItems(
  items: GroceryItemWithStatus[],
  filters: InventoryFilters
): GroceryItemWithStatus[] {
  return items.filter((item) => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }
    if (filters.storage !== 'All' && item.storage !== filters.storage) {
      return false;
    }
    if (filters.status !== 'All' && item.status !== filters.status) {
      return false;
    }
    return true;
  });
}
