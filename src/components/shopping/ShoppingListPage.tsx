import { useState } from 'react';
import { Plus, ShoppingCart, Trash2, Check } from 'lucide-react';
import { useInventoryContext } from '@/context/InventoryContext';
import { ShoppingCard } from './ShoppingCard';
import { ShoppingSearchAdd } from './ShoppingSearchAdd';
import { Button } from '@/components/ui/button';
import type { GroceryItem, ShoppingListItem } from '@/types';
import { isGoogleSheetsConnected, updateItemInSheet, addItemToSheet } from '@/lib/sheets';

export function ShoppingListPage() {
  const { items: inventoryItems, dispatch: inventoryDispatch, shopping } = useInventoryContext();
  const { uncheckedItems, checkedItems, grouped, totalQty, dispatch } = shopping;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const handleCheck = (id: string) => {
    const item = uncheckedItems.find((i) => i.id === id);
    if (!item) return;

    dispatch({ type: 'CHECK_ITEM', id });

    if (item.inventoryItemId) {
      const existingItem = inventoryItems.find((i) => i.id === item.inventoryItemId);
      if (existingItem) {
        const newQty = existingItem.qtyOnHand + item.qty;
        inventoryDispatch({
          type: 'EDIT_ITEM',
          id: existingItem.id,
          updates: { qtyOnHand: newQty },
        });
        if (isGoogleSheetsConnected()) {
          updateItemInSheet({ ...existingItem, qtyOnHand: newQty, lastUpdated: new Date().toISOString().split('T')[0] }).catch(console.error);
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
        addItemToSheet({ ...newItem, lastUpdated: new Date().toISOString().split('T')[0] }).catch(console.error);
      }
    }
  };

  const handleUncheck = (id: string) => {
    dispatch({ type: 'UNCHECK_ITEM', id });
  };

  const handleClearChecked = () => {
    dispatch({ type: 'REMOVE_CHECKED' });
  };

  const handleAddItem = (item: Omit<ShoppingListItem, 'id' | 'checked' | 'createdAt'>) => {
    dispatch({ type: 'ADD_ITEM', item });
    // Show confirmation briefly, keep form open so user can add more
    setLastAdded(item.name);
    setTimeout(() => setLastAdded(null), 2000);
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Shopping List</h2>
          <p className="text-xs text-muted-foreground">
            {uncheckedItems.length} items · {totalQty} total units
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1"
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

      {/* Added confirmation */}
      {lastAdded && (
        <div className="mb-3 flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-2 rounded-lg">
          <Check className="w-3.5 h-3.5" />
          Added "{lastAdded}" to shopping list
        </div>
      )}

      {/* Search-first Add Form */}
      {showAddForm && (
        <div className="mb-4">
          <ShoppingSearchAdd
            inventoryItems={inventoryItems}
            onAdd={handleAddItem}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Unchecked Items — always visible, even when add form is open */}
      {uncheckedItems.length === 0 && !showAddForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-base font-medium">Shopping list is empty</p>
          <p className="text-sm mt-1">Search and add items you need to buy</p>
          <Button size="sm" className="mt-4 gap-1" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Add item
          </Button>
        </div>
      ) : uncheckedItems.length > 0 ? (
        <div className="space-y-5">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
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
            </div>
          ))}
        </div>
      ) : null}

      {/* Bought Items */}
      {checkedItems.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bought ({checkedItems.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground gap-1"
              onClick={handleClearChecked}
            >
              <Trash2 className="w-3 h-3" /> Clear
            </Button>
          </div>
          <div className="space-y-2 opacity-60">
            {checkedItems.map((item) => (
              <ShoppingCard
                key={item.id}
                item={item}
                isEditing={false}
                onCheck={() => handleUncheck(item.id)}
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
