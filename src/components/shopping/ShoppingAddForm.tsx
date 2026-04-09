import { useState } from 'react';
import type { ShoppingListItem } from '@/types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { findDuplicates } from '@/lib/duplicates';
import { useInventoryContext } from '@/context/InventoryContext';

interface ShoppingAddFormProps {
  onSave: (data: Omit<ShoppingListItem, 'id' | 'checked' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ShoppingAddForm({ onSave, onCancel }: ShoppingAddFormProps) {
  const { items, shopping } = useInventoryContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [storage, setStorage] = useState(STORAGE_LOCATIONS[0]);
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState(UNITS[0]);
  const [notes, setNotes] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    // Check both inventory and shopping list for duplicates
    const allNames = [
      ...items.map((i) => i.name),
      ...shopping.items.map((i) => i.name),
    ];
    const dup = findDuplicates(val, allNames);
    setDuplicateWarning(dup ? `Similar item: "${dup}"` : null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), category, storage, qty, unit, notes: notes.trim() });
  };

  return (
    <Card className="ring-2 ring-primary/30">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Add to Shopping List</h3>

        <Input placeholder="Item name *" value={name} onChange={(e) => handleNameChange(e.target.value)} />
        {duplicateWarning && (
          <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">{duplicateWarning}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={storage} onValueChange={(v) => setStorage(v as typeof storage)}>
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
              value={qty}
              onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
              step="0.5"
              min="0"
              inputMode="decimal"
              className="h-8 text-sm mt-0.5"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Unit</label>
            <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
              <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground">Notes</label>
            <Input
              placeholder="Optional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-8 text-sm mt-0.5"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className="flex-1" onClick={handleSave} disabled={!name.trim()}>Add Item</Button>
        </div>
      </CardContent>
    </Card>
  );
}
