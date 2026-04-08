import { Link } from 'react-router-dom';
import type { GroceryItemWithStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface LowStockAlertProps {
  items: GroceryItemWithStatus[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Needs Attention</h2>
        <Link
          to="/shopping"
          className="text-sm font-medium text-primary hover:text-primary-light"
        >
          View Shopping List
        </Link>
      </div>
      <div className="space-y-2">
        {items.slice(0, 8).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg px-4 py-3 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.qtyOnHand} {item.unit} left — need {item.needToBuy} {item.unit}
              </p>
            </div>
            <StatusBadge status={item.status} />
          </div>
        ))}
      </div>
      {items.length > 8 && (
        <Link
          to="/shopping"
          className="block text-center text-sm text-primary font-medium mt-3 py-2"
        >
          +{items.length - 8} more items
        </Link>
      )}
    </div>
  );
}
