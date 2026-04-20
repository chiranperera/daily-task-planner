import { useState, useMemo } from 'react';
import { Search, Plus, ArrowRight } from 'lucide-react';
import type { GroceryItemWithStatus, ShoppingListItem, Category, StorageLocation, Unit } from '@/types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ProductIcon } from '@/components/shared/ProductIcon';

interface ShoppingSearchAddProps {
  inventoryItems: GroceryItemWithStatus[];
  onAdd: (item: Omit<ShoppingListItem, 'id' | 'checked' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ShoppingSearchAdd({ inventoryItems, onAdd, onCancel }: ShoppingSearchAddProps) {
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(CATEGORIES[0]);
  const [newStorage, setNewStorage] = useState<StorageLocation>(STORAGE_LOCATIONS[0]);
  const [newQty, setNewQty] = useState(1);
  const [newUnit, setNewUnit] = useState<Unit>(UNITS[0]);
  const [newNotes, setNewNotes] = useState('');

  const filteredItems = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return inventoryItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [search, inventoryItems]);

  const hasExactMatch = useMemo(() => {
    if (!search.trim()) return false;
    return inventoryItems.some((i) => i.name.toLowerCase() === search.toLowerCase().trim());
  }, [search, inventoryItems]);

  const handleSelectExisting = (item: GroceryItemWithStatus) => {
    onAdd({
      name: item.name,
      category: item.category,
      storage: item.storage,
      qty: item.needToBuy > 0 ? item.needToBuy : 1,
      unit: item.unit,
      notes: '',
      inventoryItemId: item.id,
      isNewProduct: false,
    });
  };

  const handleAddNew = () => {
    setNewName(search.trim());
    setShowNewForm(true);
  };

  const handleSaveNew = () => {
    if (!newName.trim()) return;
    onAdd({
      name: newName.trim(),
      category: newCategory,
      storage: newStorage,
      qty: newQty,
      unit: newUnit,
      notes: newNotes.trim(),
      isNewProduct: true,
    });
  };

  if (showNewForm) {
    return (
      <div className="bg-white border border-neutral-900 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900">Add new product</h3>
        <p className="text-[11px] text-neutral-500">
          This product will be added to Google Sheets when you check it off.
        </p>

        <Input
          placeholder="Product name *"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-2">
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newStorage} onValueChange={(v) => setNewStorage(v as StorageLocation)}>
            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STORAGE_LOCATIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-neutral-500">Qty</label>
            <Input
              type="number"
              value={newQty}
              onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
              step="0.5"
              min="0"
              inputMode="decimal"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] text-neutral-500">Unit</label>
            <Select value={newUnit} onValueChange={(v) => setNewUnit(v as Unit)}>
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
              placeholder="Optional"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="h-9 text-sm mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowNewForm(false)}>
            Back
          </Button>
          <Button size="sm" className="flex-1" onClick={handleSaveNew} disabled={!newName.trim()}>
            Add to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-900 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-neutral-900">Add to shopping list</h3>
      <p className="text-[11px] text-neutral-500">
        Search an existing product to restock, or add a new one.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input
          placeholder="Type product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      {search.trim() && (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                {filteredItems.length} matching — tap to add
              </p>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectExisting(item)}
                  className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <ProductIcon category={item.category} name={item.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-neutral-500 tabular-nums">
                      {item.category} · Have {item.qtyOnHand} {item.unit}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    {item.needToBuy > 0 && (
                      <Badge variant="danger">Need {item.needToBuy}</Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </button>
              ))}
            </>
          ) : (
            <p className="text-xs text-neutral-500 py-2">No matching products.</p>
          )}

          {!hasExactMatch && search.trim().length >= 2 && (
            <button
              onClick={handleAddNew}
              className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-md border border-dashed border-neutral-400 hover:bg-neutral-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-neutral-900 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  Add "{search.trim()}" as new product
                </p>
                <p className="text-[11px] text-neutral-500">Creates a new row in Google Sheets</p>
              </div>
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
