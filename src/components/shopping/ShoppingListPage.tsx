import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ShoppingCart, Trash2, Check } from 'lucide-react';
import { useInventoryContext } from '@/context/InventoryContext';
import { ShoppingCard } from './ShoppingCard';
import { ShoppingSearchAdd } from './ShoppingSearchAdd';
import { Button } from '@/components/ui/button';
import type { GroceryItem, ShoppingListItem } from '@/types';
import { isGoogleSheetsConnected, updateItemInSheet, addItemToSheet } from '@/lib/sheets';

export function ShoppingListPage() {
  const { items: inventoryItems, dispatch: inventoryDispatch, shopping } = useInventoryContext();
  const { uncheckedItems, checkedItems, totalQty, dispatch } = shopping;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch({ type: 'REORDER', activeId: String(active.id), overId: String(over.id) });
    }
  };

  const handleCheck = (id: string) => {
    const item = uncheckedItems.find((i) => i.id === id);
    if (!item) return;

    dispatch({ type: 'CHECK_ITEM', id });

    if (item.inventoryItemId) {
      const existingItem = inventoryItems.find((i) => i.id === item.inventoryItemId);
      if (existingItem) {
        const newQty = existingItem.qtyOnHand + item.qty;
        inventoryDispatch({ type: 'EDIT_ITEM', id: existingItem.id, updates: { qtyOnHand: newQty } });
        if (isGoogleSheetsConnected()) {
          updateItemInSheet({
            ...existingItem,
            qtyOnHand: newQty,
            lastUpdated: new Date().toISOString().split('T')[0],
          }).catch(console.error);
        }
      }
    } else {
      const newItem: Omit<GroceryItem, 'id' | 'lastUpdated'> = {
        name: item.name,
        category: item.category,
        storage: item.storage,
        qtyOnHand: item.qty,
        unit: item.unit,
        minLevel: 0,
        restockTo: item.qty,
        notes: item.notes,
      };
      inventoryDispatch({ type: 'ADD_ITEM', item: newItem });
      if (isGoogleSheetsConnected()) {
        addItemToSheet({
          ...newItem,
          lastUpdated: new Date().toISOString().split('T')[0],
        }).catch(console.error);
      }
    }
  };

  const handleAddItem = (item: Omit<ShoppingListItem, 'id' | 'checked' | 'createdAt'>) => {
    dispatch({ type: 'ADD_ITEM', item });
    setLastAdded(item.name);
    setTimeout(() => setLastAdded(null), 2000);
  };

  return (
    <div className="px-5 py-6">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            List
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-1">
            Shopping
          </h2>
          <p className="text-[11px] text-neutral-500 tabular-nums mt-1">
            {uncheckedItems.length} items · {totalQty} total units
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5"
          variant={showAddForm ? 'outline' : 'default'}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? (
            <span className="text-xs">Done</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span className="text-xs">Add</span>
            </>
          )}
        </Button>
      </div>

      {lastAdded && (
        <div className="mb-3 flex items-center gap-2 bg-neutral-900 text-white text-xs font-medium px-3 py-2 rounded-md">
          <Check className="w-3.5 h-3.5" />
          Added "{lastAdded}" to list
        </div>
      )}

      {showAddForm && (
        <div className="mb-4">
          <ShoppingSearchAdd
            inventoryItems={inventoryItems}
            onAdd={handleAddItem}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {uncheckedItems.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={uncheckedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {uncheckedItems.map((item) => (
                <ShoppingCard
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onCheck={() => handleCheck(item.id)}
                  onStartEdit={() => setEditingId(item.id)}
                  onSaveEdit={(updates) => {
                    dispatch({ type: 'EDIT_ITEM', id: item.id, updates });
                    setEditingId(null);
                  }}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => dispatch({ type: 'DELETE_ITEM', id: item.id })}
                  onQtyChange={(qty) => dispatch({ type: 'UPDATE_QTY', id: item.id, qty })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {uncheckedItems.length === 0 && !showAddForm && (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-900">Your list is empty</p>
          <p className="text-xs text-neutral-500 mt-1">
            Search and add items you need to buy
          </p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Add item
          </Button>
        </div>
      )}

      {checkedItems.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.18em]">
              Bought ({checkedItems.length})
            </h3>
            <button
              onClick={() => dispatch({ type: 'REMOVE_CHECKED' })}
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="space-y-1.5 opacity-50">
            {checkedItems.map((item) => (
              <ShoppingCard
                key={item.id}
                item={item}
                isEditing={false}
                onCheck={() => dispatch({ type: 'UNCHECK_ITEM', id: item.id })}
                onStartEdit={() => {}}
                onSaveEdit={() => {}}
                onCancelEdit={() => {}}
                onDelete={() => dispatch({ type: 'DELETE_ITEM', id: item.id })}
                onQtyChange={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
