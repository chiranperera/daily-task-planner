import { useState } from 'react';
import { Plus, CheckCheck } from 'lucide-react';
import type { Category, GroceryItem, GroceryItemWithStatus } from '@/types';
import { CATEGORIES } from '@/types';
import { useInventoryContext } from '@/context/InventoryContext';
import { ShoppingItem } from './ShoppingItem';
import { ShoppingAddForm } from './ShoppingAddForm';
import { Button } from '@/components/ui/button';
import { getProductIcon } from '@/lib/product-icons';

export function ShoppingListPage() {
  const { shoppingList, stats, dispatch, addItem } = useInventoryContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handlePurchase = (id: string) => {
    dispatch({ type: 'MARK_PURCHASED', id });
  };

  const handlePurchaseAll = () => {
    if (shoppingList.length === 0) return;
    dispatch({ type: 'MARK_ALL_PURCHASED', ids: shoppingList.map((i) => i.id) });
  };

  const handleAddItem = (data: Omit<GroceryItem, 'id' | 'lastUpdated'>) => {
    addItem(data);
    setShowAddForm(false);
  };

  const handleInlineEdit = (item: GroceryItemWithStatus, updates: Partial<GroceryItem>) => {
    dispatch({ type: 'EDIT_ITEM', id: item.id, updates });
    setEditingId(null);
  };

  // Group by category
  const grouped = shoppingList.reduce<Record<string, GroceryItemWithStatus[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Shopping List</h2>
          <p className="text-xs text-muted-foreground">
            {shoppingList.length} items · {stats.unitsToBuy} total units
          </p>
        </div>
        <div className="flex gap-2">
          {shoppingList.length > 0 && (
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handlePurchaseAll}>
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="text-xs">All Done</span>
            </Button>
          )}
          <Button size="sm" className="h-8 gap-1" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs">Add</span>
          </Button>
        </div>
      </div>

      {/* Add New Item Form (inline) */}
      {showAddForm && (
        <div className="mb-4">
          <ShoppingAddForm onSave={handleAddItem} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {/* Shopping Items */}
      {shoppingList.length === 0 && !showAddForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-2">{getProductIcon('check', 'Produce')}</div>
          <p className="text-base font-medium">All stocked up!</p>
          <p className="text-sm mt-1">No items need restocking right now</p>
          <Button size="sm" className="mt-4 gap-1" onClick={() => setShowAddForm(true)}>
            <Plus className="w-3.5 h-3.5" /> Add custom item
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {(CATEGORIES as Category[]).map((cat) => {
            const catItems = grouped[cat];
            if (!catItems || catItems.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {catItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      isEditing={editingId === item.id}
                      onPurchase={handlePurchase}
                      onStartEdit={() => setEditingId(item.id)}
                      onSaveEdit={(updates) => handleInlineEdit(item, updates)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
