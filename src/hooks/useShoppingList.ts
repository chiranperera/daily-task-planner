import { useReducer, useEffect, useMemo } from 'react';
import type { ShoppingListItem } from '@/types';

const STORAGE_KEY = 'grocery-shopping-list';

function loadList(): ShoppingListItem[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ShoppingListItem[];
  } catch {
    return [];
  }
}

function saveList(items: ShoppingListItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

type Action =
  | { type: 'ADD_ITEM'; item: Omit<ShoppingListItem, 'id' | 'checked' | 'createdAt'> }
  | { type: 'EDIT_ITEM'; id: string; updates: Partial<ShoppingListItem> }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'UPDATE_QTY'; id: string; qty: number }
  | { type: 'CHECK_ITEM'; id: string }
  | { type: 'UNCHECK_ITEM'; id: string }
  | { type: 'REMOVE_CHECKED' }
  | { type: 'REORDER'; activeId: string; overId: string };

function reducer(state: ShoppingListItem[], action: Action): ShoppingListItem[] {
  switch (action.type) {
    case 'ADD_ITEM':
      return [
        ...state,
        {
          ...action.item,
          id: crypto.randomUUID(),
          checked: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ];

    case 'EDIT_ITEM':
      return state.map((item) =>
        item.id === action.id ? { ...item, ...action.updates } : item
      );

    case 'DELETE_ITEM':
      return state.filter((item) => item.id !== action.id);

    case 'UPDATE_QTY':
      return state.map((item) =>
        item.id === action.id ? { ...item, qty: Math.max(0, action.qty) } : item
      );

    case 'CHECK_ITEM':
      return state.map((item) =>
        item.id === action.id ? { ...item, checked: true } : item
      );

    case 'UNCHECK_ITEM':
      return state.map((item) =>
        item.id === action.id ? { ...item, checked: false } : item
      );

    case 'REMOVE_CHECKED':
      return state.filter((item) => !item.checked);

    case 'REORDER': {
      const items = [...state];
      const activeIndex = items.findIndex((i) => i.id === action.activeId);
      const overIndex = items.findIndex((i) => i.id === action.overId);
      if (activeIndex === -1 || overIndex === -1) return state;
      const [moved] = items.splice(activeIndex, 1);
      items.splice(overIndex, 0, moved);
      return items;
    }

    default:
      return state;
  }
}

export function useShoppingList() {
  const [items, dispatch] = useReducer(reducer, null, loadList);

  useEffect(() => {
    saveList(items);
  }, [items]);

  const uncheckedItems = useMemo(() => items.filter((i) => !i.checked), [items]);
  const checkedItems = useMemo(() => items.filter((i) => i.checked), [items]);

  // Group by category — include ALL categories that have items, not just predefined ones
  const grouped = useMemo(() => {
    const groups: Record<string, ShoppingListItem[]> = {};
    for (const item of uncheckedItems) {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    // Sort categories alphabetically
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, items]) => ({ category, items }));
  }, [uncheckedItems]);

  const totalQty = useMemo(
    () => uncheckedItems.reduce((sum, i) => sum + i.qty, 0),
    [uncheckedItems]
  );

  return {
    items,
    uncheckedItems,
    checkedItems,
    grouped,
    totalQty,
    dispatch,
  };
}
