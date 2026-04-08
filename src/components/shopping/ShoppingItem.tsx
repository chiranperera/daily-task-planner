import { useState } from 'react';
import { Check, Pencil, Minus, Plus } from 'lucide-react';
import type { GroceryItem, GroceryItemWithStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProductIcon, getCategoryColor } from '@/lib/product-icons';
import { cn } from '@/lib/utils';

interface ShoppingItemProps {
  item: GroceryItemWithStatus;
  isEditing: boolean;
  onPurchase: (id: string) => void;
  onStartEdit: () => void;
  onSaveEdit: (updates: Partial<GroceryItem>) => void;
  onCancelEdit: () => void;
}

export function ShoppingItem({
  item,
  isEditing,
  onPurchase,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: ShoppingItemProps) {
  const [checked, setChecked] = useState(false);
  const [editQty, setEditQty] = useState(item.qtyOnHand);
  const [editNotes, setEditNotes] = useState(item.notes);

  const handleCheck = () => {
    setChecked(true);
    setTimeout(() => onPurchase(item.id), 300);
  };

  if (isEditing) {
    return (
      <Card className="ring-2 ring-primary/30">
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0', getCategoryColor(item.category))}>
              {getProductIcon(item.name, item.category)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category} · {item.unit}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Qty on Hand</label>
              <div className="flex items-center gap-1 mt-0.5">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setEditQty(Math.max(0, editQty - 0.5))}>
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(parseFloat(e.target.value) || 0)}
                  className="w-16 h-7 text-center text-sm"
                  step="0.5"
                  min="0"
                  inputMode="decimal"
                />
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setEditQty(editQty + 0.5)}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-muted-foreground">Notes</label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add note..."
                className="h-7 text-sm mt-0.5"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-7" onClick={onCancelEdit}>Cancel</Button>
            <Button size="sm" className="flex-1 h-7" onClick={() => onSaveEdit({ qtyOnHand: editQty, notes: editNotes })}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 cursor-pointer hover:shadow-sm',
        checked && 'opacity-50 scale-[0.98]'
      )}
      onClick={onStartEdit}
    >
      <CardContent className="p-3 flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCheck();
          }}
          className={cn(
            'w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors',
            checked ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'
          )}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white" />}
        </button>

        {/* Icon */}
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0', getCategoryColor(item.category))}>
          {getProductIcon(item.name, item.category)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', checked ? 'line-through text-muted-foreground' : 'text-foreground')}>
            {item.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Have {item.qtyOnHand} {item.unit} · Restock to {item.restockTo}
          </p>
        </div>

        {/* Qty Badge + Edit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="danger" className="text-xs">
            {item.needToBuy} {item.unit}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
