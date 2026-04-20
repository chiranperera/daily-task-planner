import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Minus, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import type { ShoppingListItem } from '@/types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ProductIcon } from '@/components/shared/ProductIcon';
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

  const [editForm, setEditForm] = useState({
    name: item.name,
    category: item.category,
    storage: item.storage,
    qty: item.qty,
    unit: item.unit,
    notes: item.notes,
  });

  useEffect(() => {
    if (isEditing) {
      setEditForm({
        name: item.name,
        category: item.category,
        storage: item.storage,
        qty: item.qty,
        unit: item.unit,
        notes: item.notes,
      });
    }
  }, [isEditing, item.name, item.category, item.storage, item.qty, item.unit, item.notes]);

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <div className="bg-white border border-neutral-900 rounded-lg p-4 space-y-3">
          <h4 className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Edit item
          </h4>
          <div>
            <label className="text-[11px] text-neutral-500">Product name</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-neutral-500">Category</label>
              <Select
                value={editForm.category}
                onValueChange={(v) => setEditForm({ ...editForm, category: v as typeof editForm.category })}
              >
                <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-neutral-500">Storage</label>
              <Select
                value={editForm.storage}
                onValueChange={(v) => setEditForm({ ...editForm, storage: v as typeof editForm.storage })}
              >
                <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STORAGE_LOCATIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-neutral-500">Qty</label>
              <Input
                type="number"
                value={editForm.qty}
                onChange={(e) => setEditForm({ ...editForm, qty: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
                inputMode="decimal"
                className="h-9 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-500">Unit</label>
              <Select
                value={editForm.unit}
                onValueChange={(v) => setEditForm({ ...editForm, unit: v as typeof editForm.unit })}
              >
                <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-neutral-500">Notes</label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Optional"
                className="h-9 text-sm mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() =>
                onSaveEdit({
                  name: editForm.name.trim(),
                  category: editForm.category,
                  storage: editForm.storage,
                  qty: editForm.qty,
                  unit: editForm.unit,
                  notes: editForm.notes.trim(),
                })
              }
              disabled={!editForm.name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'bg-white border border-neutral-200 rounded-lg transition-all',
          item.checked && 'opacity-60',
          isDragging && 'shadow-md'
        )}
      >
        <div className="p-3">
          <div className="flex items-start gap-2">
            {!item.checked && (
              <button
                {...attributes}
                {...listeners}
                className="drag-handle mt-1.5 p-0.5 text-neutral-300 hover:text-neutral-500 flex-shrink-0"
                aria-label="Drag"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onCheck}
              className={cn(
                'w-5 h-5 mt-1 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                item.checked
                  ? 'bg-neutral-900 border-neutral-900'
                  : 'border-neutral-300 hover:border-neutral-900'
              )}
            >
              {item.checked && <Check className="w-3 h-3 text-white" />}
            </button>

            <ProductIcon category={item.category} name={item.name} className="mt-0.5" />

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold',
                  item.checked ? 'line-through text-neutral-500' : 'text-neutral-900'
                )}
              >
                {item.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500">
                <span>{item.category}</span>
                <span className="text-neutral-300">·</span>
                <span>{item.storage}</span>
                {item.notes && (
                  <>
                    <span className="text-neutral-300">·</span>
                    <span className="italic">{item.notes}</span>
                  </>
                )}
              </div>

              {!item.checked && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onQtyChange(Math.max(0, item.qty - 0.5))}
                      className="h-7 w-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="min-w-[3.5rem] text-center tabular-nums">
                      <span className="text-base font-semibold text-neutral-900">{item.qty}</span>
                      <span className="text-[11px] text-neutral-500 ml-0.5">{item.unit}</span>
                    </div>
                    <button
                      onClick={() => onQtyChange(item.qty + 0.5)}
                      className="h-7 w-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onStartEdit}
                      className="h-7 px-2.5 rounded-md flex items-center gap-1 text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Edit</span>
                    </button>
                    <button
                      onClick={onDelete}
                      className="h-7 px-2.5 rounded-md flex items-center gap-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
