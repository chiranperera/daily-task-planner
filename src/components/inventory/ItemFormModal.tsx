import { useState, useEffect } from 'react';
import type { GroceryItem } from '@/types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { findDuplicates } from '@/lib/duplicates';
import { useInventoryContext } from '@/context/InventoryContext';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: GroceryItem | null;
  onSave: (data: Omit<GroceryItem, 'id' | 'lastUpdated'>) => void;
}

const emptyForm = {
  name: '',
  category: CATEGORIES[0],
  storage: STORAGE_LOCATIONS[0],
  qtyOnHand: 0,
  unit: UNITS[0],
  minLevel: 0,
  restockTo: 0,
  notes: '',
};

export function ItemFormModal({ isOpen, onClose, item, onSave }: ItemFormModalProps) {
  const { items } = useInventoryContext();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setForm({
          name: item.name,
          category: item.category,
          storage: item.storage,
          qtyOnHand: item.qtyOnHand,
          unit: item.unit,
          minLevel: item.minLevel,
          restockTo: item.restockTo,
          notes: item.notes,
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
      setDuplicateWarning(null);
    }
  }, [isOpen, item]);

  const checkDuplicate = (name: string) => {
    const existingNames = items.map((i) => i.name);
    const dup = findDuplicates(name, existingNames, item?.id);
    setDuplicateWarning(dup ? `Similar item found: "${dup}"` : null);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.qtyOnHand < 0) errs.qtyOnHand = 'Must be >= 0';
    if (form.minLevel < 0) errs.minLevel = 'Must be >= 0';
    if (form.restockTo < 0) errs.restockTo = 'Must be >= 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      category: form.category,
      storage: form.storage,
      qtyOnHand: form.qtyOnHand,
      unit: form.unit,
      minLevel: form.minLevel,
      restockTo: form.restockTo,
      notes: form.notes.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="mx-4">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the item details below.' : 'Add a new grocery item to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Item Name</label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                checkDuplicate(e.target.value);
              }}
              placeholder="e.g. White Rice"
              className="mt-1"
            />
            {errors.name && <p className="text-xs text-destructive mt-0.5">{errors.name}</p>}
            {duplicateWarning && (
              <p className="text-xs text-amber-600 mt-0.5 bg-amber-50 px-2 py-1 rounded">{duplicateWarning}</p>
            )}
          </div>

          {/* Category + Storage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Storage</label>
              <Select value={form.storage} onValueChange={(v) => setForm({ ...form, storage: v as typeof form.storage })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STORAGE_LOCATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Qty + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Qty on Hand</label>
              <Input
                type="number"
                value={form.qtyOnHand}
                onChange={(e) => setForm({ ...form, qtyOnHand: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
                inputMode="decimal"
                className="mt-1"
              />
              {errors.qtyOnHand && <p className="text-xs text-destructive mt-0.5">{errors.qtyOnHand}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Unit</label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v as typeof form.unit })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Min Level + Restock To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Min Level</label>
              <Input
                type="number"
                value={form.minLevel}
                onChange={(e) => setForm({ ...form, minLevel: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
                inputMode="decimal"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Restock To</label>
              <Input
                type="number"
                value={form.restockTo}
                onChange={(e) => setForm({ ...form, restockTo: parseFloat(e.target.value) || 0 })}
                step="0.5"
                min="0"
                inputMode="decimal"
                className="mt-1"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional notes"
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1">{item ? 'Save Changes' : 'Add Item'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
