import { useReducer, useEffect, useMemo } from 'react';
import type { ShoppingListItem, Category } from '@/types';
import { CATEGORIES } from '@/types';

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
  | { type: 'REMOVE_CHECKED' };

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

  const grouped = useMemo(() => {
    const groups: Record<string, ShoppingListItem[]> = {};
    for (const item of uncheckedItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    // Return in category order
    const ordered: { category: Category; items: ShoppingListItem[] }[] = [];
    for (const cat of CATEGORIES) {
      if (groups[cat]?.length) ordered.push({ category: cat, items: groups[cat] });
    }
    return ordered;
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
