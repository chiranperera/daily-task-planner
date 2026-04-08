import { useInventoryContext } from '../../context/InventoryContext';
import { ShoppingItem } from './ShoppingItem';
import { EmptyState } from '../shared/EmptyState';
import type { Category } from '../../types';

export function ShoppingListPage() {
  const { shoppingList, stats, dispatch } = useInventoryContext();

  const handlePurchase = (id: string) => {
    dispatch({ type: 'MARK_PURCHASED', id });
  };

  const handlePurchaseAll = () => {
    if (shoppingList.length === 0) return;
    const ids = shoppingList.map((i) => i.id);
    dispatch({ type: 'MARK_ALL_PURCHASED', ids });
  };

  // Group by category
  const grouped = shoppingList.reduce<Record<string, typeof shoppingList>>(
    (acc, item) => {
      const key = item.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );

  const categoryOrder: Category[] = [
    'Grains & Staples',
    'Breakfast',
    'Dinner',
    'Produce',
    'Cooking Essentials',
  ];

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Shopping List</h2>
          <p className="text-xs text-gray-500">
            {shoppingList.length} items · {stats.unitsToBuy} total units
          </p>
        </div>
        {shoppingList.length > 0 && (
          <button
            onClick={handlePurchaseAll}
            className="text-xs bg-primary text-white font-medium px-3 py-1.5 rounded-lg active:bg-primary-dark"
          >
            Mark All Done
          </button>
        )}
      </div>

      {shoppingList.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="All stocked up!"
          description="No items need restocking right now"
        />
      ) : (
        <div className="space-y-5">
          {categoryOrder.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onPurchase={handlePurchase}
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
