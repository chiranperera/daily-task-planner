import type { GroceryItemWithStatus } from '../../types';
import { StatusBadge } from '../shared/StatusBadge';

interface InventoryCardProps {
  item: GroceryItemWithStatus;
  onQuickUpdate: (item: GroceryItemWithStatus) => void;
  onEdit: (item: GroceryItemWithStatus) => void;
  onDelete: (item: GroceryItemWithStatus) => void;
}

export function InventoryCard({ item, onQuickUpdate, onEdit, onDelete }: InventoryCardProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
            <StatusBadge status={item.status} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-gray-500">{item.category}</span>
            <span className="text-xs text-gray-400">{item.storage}</span>
          </div>
          {item.notes && (
            <p className="text-xs text-gray-400 mt-1 italic">{item.notes}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => onQuickUpdate(item)}
            className="text-right"
          >
            <span className="text-lg font-bold text-gray-900">{item.qtyOnHand}</span>
            <span className="text-xs text-gray-500 ml-0.5">{item.unit}</span>
          </button>
          {item.needToBuy > 0 && (
            <span className="text-[10px] text-red-500 font-medium">
              Need {item.needToBuy}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
        <span className="text-[10px] text-gray-400">Updated {item.lastUpdated}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="text-xs text-primary font-medium hover:text-primary-light"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="text-xs text-red-500 font-medium hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
