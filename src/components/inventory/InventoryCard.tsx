import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      <Card className={cn('transition-shadow', isDragging && 'shadow-lg')}>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="drag-handle mt-1 p-0.5 text-muted-foreground/50 hover:text-muted-foreground flex-shrink-0"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            {/* Product Icon */}
            <ProductIcon category={item.category} className="mt-0.5" />

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{item.name}</h3>
                <Badge variant={statusBadgeVariant[item.status]} className="text-[10px] flex-shrink-0">
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{item.category}</span>
                <span className="text-[11px] text-muted-foreground/50">·</span>
                <span className="text-[11px] text-muted-foreground">{item.storage}</span>
              </div>
              {item.notes && (
                <p className="text-[11px] text-muted-foreground italic mt-0.5 truncate">{item.notes}</p>
              )}

              {/* Inline Stepper + Actions Row */}
              <div className="flex items-center justify-between mt-2">
                {/* Qty Stepper */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => onQtyChange(item.id, Math.max(0, item.qtyOnHand - 0.5))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="min-w-[4rem] text-center">
                    <span className="text-base font-bold text-foreground">{item.qtyOnHand}</span>
                    <span className="text-[11px] text-muted-foreground ml-0.5">{item.unit}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => onQtyChange(item.id, item.qtyOnHand + 0.5)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                {/* Edit / Delete - Well separated */}
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary" onClick={() => onEdit(item)}>
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-destructive" onClick={() => onDelete(item)}>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                <span>Min: {item.minLevel}</span>
                <span>Restock: {item.restockTo}</span>
                {item.needToBuy > 0 && (
                  <span className="text-red-500 font-medium">Need {item.needToBuy}</span>
                )}
                <span className="ml-auto">{item.lastUpdated}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
