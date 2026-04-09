import { useState } from 'react';
import { Check, Minus, Plus, Pencil, Trash2 } from 'lucide-react';
import type { ShoppingListItem } from '@/types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getProductIcon, getCategoryColor } from '@/lib/product-icons';
import { cn } from '@/lib/utils';

interface ShoppingCardProps {
  item: ShoppingListItem;
  isEditing: boolean;
  onCheck: () => void;
  onStartEdit: () => void;
  onSaveEdit: (updates: Partial<ShoppingListItem>) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onQtyChange: (qty: number) => void;
}

export function ShoppingCard({
  item,
  isEditing,
  onCheck,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onQtyChange,
}: ShoppingCardProps) {
  const [editForm, setEditForm] = useState({
    name: item.name,
    category: item.category,
    storage: item.storage,
    qty: item.qty,
    unit: item.unit,
    notes: item.notes,
  });

  if (isEditing) {
    return (
      <Card className="ring-2 ring-primary/30">
        <CardContent className="p-3 space-y-3">
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Item name"
            className="h-8 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v as typeof editForm.category })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={editForm.storage} onValueChange={(v) => setEditForm({ ...editForm, storage: v as typeof editForm.storage })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STORAGE_LOCATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground">Qty</label>
              <Input
                type="number"
                value={editForm.qty}
                onChange={(e) => setEditForm({ ...editForm, qty: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
                inputMode="decimal"
                className="h-8 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Unit</label>
              <Select value={editForm.unit} onValueChange={(v) => setEditForm({ ...editForm, unit: v as typeof editForm.unit })}>
                <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Notes</label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="h-8 text-sm mt-0.5"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 h-7" onClick={onCancelEdit}>Cancel</Button>
            <Button
              size="sm"
              className="flex-1 h-7"
              onClick={() => onSaveEdit({
                name: editForm.name.trim(),
                category: editForm.category,
                storage: editForm.storage,
                qty: editForm.qty,
                unit: editForm.unit,
                notes: editForm.notes.trim(),
              })}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all', item.checked && 'opacity-60')}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2.5">
          {/* Checkbox */}
          <button
            onClick={onCheck}
            className={cn(
              'w-6 h-6 mt-0.5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors',
              item.checked ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'
            )}
          >
            {item.checked && <Check className="w-3.5 h-3.5 text-white" />}
          </button>

          {/* Icon */}
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0', getCategoryColor(item.category))}>
            {getProductIcon(item.name, item.category)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold', item.checked ? 'line-through text-muted-foreground' : 'text-foreground')}>
              {item.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground">{item.category}</span>
              {item.notes && (
                <>
                  <span className="text-[11px] text-muted-foreground/50">·</span>
                  <span className="text-[11px] text-muted-foreground italic">{item.notes}</span>
                </>
              )}
            </div>

            {/* Stepper + Actions */}
            {!item.checked && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => onQtyChange(Math.max(0, item.qty - 0.5))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="min-w-[3.5rem] text-center">
                    <span className="text-base font-bold text-foreground">{item.qty}</span>
                    <span className="text-[11px] text-muted-foreground ml-0.5">{item.unit}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => onQtyChange(item.qty + 0.5)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-primary" onClick={onStartEdit}>
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-destructive" onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Qty Badge */}
          <Badge variant={item.checked ? 'secondary' : 'danger'} className="text-xs flex-shrink-0 mt-1">
            {item.qty} {item.unit}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
