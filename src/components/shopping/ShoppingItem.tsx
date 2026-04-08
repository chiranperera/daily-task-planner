import { useState } from 'react';
import type { GroceryItemWithStatus } from '../../types';

interface ShoppingItemProps {
  item: GroceryItemWithStatus;
  onPurchase: (id: string) => void;
}

export function ShoppingItem({ item, onPurchase }: ShoppingItemProps) {
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    setChecked(true);
    setTimeout(() => onPurchase(item.id), 300);
  };

  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm transition-all duration-300 ${
        checked ? 'opacity-50 scale-95' : ''
      }`}
    >
      <button
        onClick={handleCheck}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-primary border-primary'
            : 'border-gray-300 hover:border-primary'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {item.name}
        </p>
        <p className="text-xs text-gray-500">
          Have {item.qtyOnHand} {item.unit} · Restock to {item.restockTo}
        </p>
      </div>

      <div className="flex-shrink-0 bg-red-50 text-red-700 px-2.5 py-1 rounded-full">
        <span className="text-xs font-bold">{item.needToBuy}</span>
        <span className="text-[10px] ml-0.5">{item.unit}</span>
      </div>
    </div>
  );
}
