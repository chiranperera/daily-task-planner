import { useReducer, useEffect, useMemo, useCallback } from 'react';
import type { GroceryItem, GroceryItemWithStatus, DashboardStats, InventoryFilters } from '@/types';
import { withStatus, computeStats, generateShoppingList, filterItems } from '@/lib/inventory';
import { loadItems, saveItems } from '@/lib/storage';
import {
  isGoogleSheetsConnected,
  fetchAllItems,
  addItemToSheet,
  updateItemInSheet,
  deleteItemFromSheet,
} from '@/lib/sheets';

type Action =
  | { type: 'SET_ITEMS'; items: GroceryItem[] }
  | { type: 'ADD_ITEM'; item: Omit<GroceryItem, 'id' | 'lastUpdated'> }
  | { type: 'EDIT_ITEM'; id: string; updates: Partial<GroceryItem> }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'QUICK_UPDATE_QTY'; id: string; qty: number }
  | { type: 'MARK_PURCHASED'; id: string }
  | { type: 'MARK_ALL_PURCHASED'; ids: string[] }
  | { type: 'IMPORT_ITEMS'; items: Omit<GroceryItem, 'id'>[] }
  | { type: 'SET_FILTERS'; filters: Partial<InventoryFilters> }
  | { type: 'REORDER'; activeId: string; overId: string }
  | { type: 'RESET_DATA' };

interface State {
  items: GroceryItem[];
  filters: InventoryFilters;
  syncing: boolean;
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
    case 'SET_ITEMS':
      return { ...state, items: action.items };

    case 'ADD_ITEM': {
      const newItem: GroceryItem = {
        ...action.item,
        id: crypto.randomUUID(),
        lastUpdated: today,
        order: state.items.length,
      };
      return { ...state, items: [...state.items, newItem] };
    }

    case 'EDIT_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.updates, lastUpdated: today } : item
        ),
      };

    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };

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
      const newItems: GroceryItem[] = action.items.map((item, i) => ({
        ...item,
        id: crypto.randomUUID(),
        order: i,
      }));
      return { ...state, items: newItems };
    }

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };

    case 'REORDER': {
      const items = [...state.items];
      const activeIndex = items.findIndex((i) => i.id === action.activeId);
      const overIndex = items.findIndex((i) => i.id === action.overId);
      if (activeIndex === -1 || overIndex === -1) return state;
      const [moved] = items.splice(activeIndex, 1);
      items.splice(overIndex, 0, moved);
      return { ...state, items: items.map((item, i) => ({ ...item, order: i })) };
    }

    case 'RESET_DATA':
      localStorage.removeItem('grocery-inventory-items');
      return { items: loadItems(), filters: initialFilters, syncing: false };

    default:
      return state;
  }
}

export function useInventory() {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    items: loadItems(),
    filters: initialFilters,
    syncing: false,
  }));

  // Save to localStorage on every change
  useEffect(() => {
    saveItems(state.items);
  }, [state.items]);

  // Sync with Google Sheets on mount if connected
  useEffect(() => {
    if (isGoogleSheetsConnected()) {
      fetchAllItems()
        .then((items) => {
          if (items.length > 0) {
            dispatch({ type: 'SET_ITEMS', items });
          }
        })
        .catch(console.error);
    }
  }, []);

  // Sync individual operations to Google Sheets
  const dispatchWithSync = useCallback(
    (action: Action) => {
      dispatch(action);

      if (!isGoogleSheetsConnected()) return;

      // Fire-and-forget sync
      switch (action.type) {
        case 'ADD_ITEM':
          // We need the generated ID, but we can sync the full list after
          break;
        case 'EDIT_ITEM': {
          const item = state.items.find((i) => i.id === action.id);
          if (item) {
            updateItemInSheet({ ...item, ...action.updates, lastUpdated: new Date().toISOString().split('T')[0] }).catch(console.error);
          }
          break;
        }
        case 'DELETE_ITEM':
          deleteItemFromSheet(action.id).catch(console.error);
          break;
        case 'QUICK_UPDATE_QTY': {
          const item = state.items.find((i) => i.id === action.id);
          if (item) {
            updateItemInSheet({ ...item, qtyOnHand: action.qty, lastUpdated: new Date().toISOString().split('T')[0] }).catch(console.error);
          }
          break;
        }
        case 'MARK_PURCHASED': {
          const item = state.items.find((i) => i.id === action.id);
          if (item) {
            updateItemInSheet({ ...item, qtyOnHand: item.restockTo, lastUpdated: new Date().toISOString().split('T')[0] }).catch(console.error);
          }
          break;
        }
      }
    },
    [state.items]
  );

  // After ADD_ITEM, sync the new item to the sheet
  const addItem = useCallback(
    (item: Omit<GroceryItem, 'id' | 'lastUpdated'>) => {
      dispatch({ type: 'ADD_ITEM', item });
      if (isGoogleSheetsConnected()) {
        addItemToSheet({ ...item, lastUpdated: new Date().toISOString().split('T')[0] }).catch(console.error);
      }
    },
    []
  );

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
    dispatch: dispatchWithSync,
    addItem,
  };
}
