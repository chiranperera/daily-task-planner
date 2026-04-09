import { useState } from 'react';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useInventoryContext } from '@/context/InventoryContext';
import { ShoppingCard } from './ShoppingCard';
import { ShoppingAddForm } from './ShoppingAddForm';
import { Button } from '@/components/ui/button';

export function ShoppingListPage() {
  const { shopping, addItem: addToInventory } = useInventoryContext();
  const { uncheckedItems, checkedItems, grouped, totalQty, dispatch } = shopping;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCheck = (id: string) => {
    // Mark as checked
    dispatch({ type: 'CHECK_ITEM', id });

    // Find the item and add/update in inventory
    const item = [...uncheckedItems, ...checkedItems].find((i) => i.id === id);
    if (item) {
      addToInventory({
        name: item.name,
        category: item.category,
        storage: item.storage,
        qtyOnHand: item.qty,
        unit: item.unit,
        minLevel: 0,
        restockTo: item.qty,
        notes: item.notes,
      });
    }
  };

  const handleUncheck = (id: string) => {
    dispatch({ type: 'UNCHECK_ITEM', id });
  };

  const handleClearChecked = () => {
    dispatch({ type: 'REMOVE_CHECKED' });
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
        <Button size="sm" className="h-8 gap-1" onClick={() => setShowAddForm(true)}>
          <Plus className="w-3.5 h-3.5" />
          <span className="text-xs">Add</span>
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4">
          <ShoppingAddForm
            onSave={(item) => {
              dispatch({ type: 'ADD_ITEM', item });
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Unchecked Items - grouped by category */}
      {uncheckedItems.length === 0 && !showAddForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-base font-medium">Shopping list is empty</p>
          <p className="text-sm mt-1">Add items you need to buy</p>
          <Button size="sm" className="mt-4 gap-1" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Add item
          </Button>
        </div>
      ) : (
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
      )}

      {/* Checked / Bought Items */}
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
