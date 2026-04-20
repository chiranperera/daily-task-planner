import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProductIcon } from '@/components/shared/ProductIcon';
import type { GroceryItemWithStatus, ItemStatus } from '@/types';
import { cn } from '@/lib/utils';

interface InventoryCardProps {
  item: GroceryItemWithStatus;
  onEdit: (item: GroceryItemWithStatus) => void;
  onDelete: (item: GroceryItemWithStatus) => void;
  onQtyChange: (id: string, qty: number) => void;
}

const statusBadgeVariant: Record<ItemStatus, 'danger' | 'warning' | 'success'> = {
  'LOW STOCK': 'danger',
  'WATCH': 'warning',
  'OK': 'success',
};

export function InventoryCard({ item, onEdit, onDelete, onQtyChange }: InventoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'bg-white border border-neutral-200 rounded-lg transition-shadow',
          isDragging && 'shadow-md'
        )}
      >
        <div className="p-3">
          <div className="flex items-start gap-2">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="drag-handle mt-1 p-0.5 text-neutral-300 hover:text-neutral-500 flex-shrink-0"
              aria-label="Drag"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <ProductIcon category={item.category} name={item.name} className="mt-0.5" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-neutral-900 truncate">
                  {item.name}
                </h3>
                <Badge variant={statusBadgeVariant[item.status]} className="flex-shrink-0 mt-0.5">
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500">
                <span>{item.category}</span>
                <span className="text-neutral-300">·</span>
                <span>{item.storage}</span>
              </div>
              {item.notes && (
                <p className="text-[11px] text-neutral-500 italic mt-0.5 truncate">
                  {item.notes}
                </p>
              )}

              {/* Stepper + actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onQtyChange(item.id, Math.max(0, item.qtyOnHand - 0.5))}
                    className="h-7 w-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="min-w-[4rem] text-center tabular-nums">
                    <span className="text-base font-semibold text-neutral-900">
                      {item.qtyOnHand}
                    </span>
                    <span className="text-[11px] text-neutral-500 ml-0.5">{item.unit}</span>
                  </div>
                  <button
                    onClick={() => onQtyChange(item.id, item.qtyOnHand + 0.5)}
                    className="h-7 w-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="h-7 px-2.5 rounded-md flex items-center gap-1 text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="h-7 px-2.5 rounded-md flex items-center gap-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Delete</span>
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-neutral-100 text-[10px] text-neutral-500 tabular-nums">
                <span>Min {item.minLevel}</span>
                <span>Restock {item.restockTo}</span>
                {item.needToBuy > 0 && (
                  <span className="font-semibold text-neutral-900">
                    Need {item.needToBuy}
                  </span>
                )}
                <span className="ml-auto">{item.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
