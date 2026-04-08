import { useReducer, useEffect, useMemo } from 'react';
import type { GroceryItem, GroceryItemWithStatus, DashboardStats, InventoryFilters } from '../types';
import { withStatus, computeStats, generateShoppingList, filterItems } from '../lib/inventory';
import { loadItems, saveItems } from '../lib/storage';

type Action =
  | { type: 'ADD_ITEM'; item: Omit<GroceryItem, 'id' | 'lastUpdated'> }
  | { type: 'EDIT_ITEM'; id: string; updates: Partial<GroceryItem> }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'QUICK_UPDATE_QTY'; id: string; qty: number }
  | { type: 'MARK_PURCHASED'; id: string }
  | { type: 'MARK_ALL_PURCHASED'; ids: string[] }
  | { type: 'IMPORT_ITEMS'; items: Omit<GroceryItem, 'id'>[] }
  | { type: 'SET_FILTERS'; filters: Partial<InventoryFilters> }
  | { type: 'RESET_DATA' };

interface State {
  items: GroceryItem[];
  filters: InventoryFilters;
}

const initialFilters: InventoryFilters = {
  search: '',
  category: 'All',
  storage: 'All',
  status: 'All',
};

function reducer(state: State, action: Action): State {
  const today = new Date().toISOString().split('T')[0];

  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [
          ...state.items,
          { ...action.item, id: crypto.randomUUID(), lastUpdated: today },
        ],
      };

    case 'EDIT_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, ...action.updates, lastUpdated: today }
            : item
        ),
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
      };

    case 'QUICK_UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, qtyOnHand: Math.max(0, action.qty), lastUpdated: today }
            : item
        ),
      };

    case 'MARK_PURCHASED':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, qtyOnHand: item.restockTo, lastUpdated: today }
            : item
        ),
      };

    case 'MARK_ALL_PURCHASED':
      return {
        ...state,
        items: state.items.map((item) =>
          action.ids.includes(item.id)
            ? { ...item, qtyOnHand: item.restockTo, lastUpdated: today }
            : item
        ),
      };

    case 'IMPORT_ITEMS': {
      const newItems: GroceryItem[] = action.items.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      }));
      return { ...state, items: newItems };
    }

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };

    case 'RESET_DATA':
      localStorage.removeItem('grocery-inventory-items');
      return { items: loadItems(), filters: initialFilters };

    default:
      return state;
  }
}

export function useInventory() {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    items: loadItems(),
    filters: initialFilters,
  }));

  useEffect(() => {
    saveItems(state.items);
  }, [state.items]);

  const itemsWithStatus: GroceryItemWithStatus[] = useMemo(
    () => state.items.map(withStatus),
    [state.items]
  );

  const filteredItems: GroceryItemWithStatus[] = useMemo(
    () => filterItems(itemsWithStatus, state.filters),
    [itemsWithStatus, state.filters]
  );

  const stats: DashboardStats = useMemo(
    () => computeStats(itemsWithStatus),
    [itemsWithStatus]
  );

  const shoppingList: GroceryItemWithStatus[] = useMemo(
    () => generateShoppingList(itemsWithStatus),
    [itemsWithStatus]
  );

  return {
    items: itemsWithStatus,
    filteredItems,
    filters: state.filters,
    stats,
    shoppingList,
    dispatch,
  };
}
