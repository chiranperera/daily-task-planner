import { useState, useMemo } from 'react';
import { Search, Plus, ArrowRight } from 'lucide-react';
import type { GroceryItemWithStatus, ShoppingListItem, Category, StorageLocation, Unit } from '@/types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getProductIcon, getCategoryColor } from '@/lib/product-icons';
import { cn } from '@/lib/utils';

interface ShoppingSearchAddProps {
  inventoryItems: GroceryItemWithStatus[];
  onAdd: (item: Omit<ShoppingListItem, 'id' | 'checked' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function ShoppingSearchAdd({ inventoryItems, onAdd, onCancel }: ShoppingSearchAddProps) {
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(CATEGORIES[0]);
  const [newStorage, setNewStorage] = useState<StorageLocation>(STORAGE_LOCATIONS[0]);
  const [newQty, setNewQty] = useState(1);
  const [newUnit, setNewUnit] = useState<Unit>(UNITS[0]);
  const [newNotes, setNewNotes] = useState('');

  // Filter inventory items by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [search, inventoryItems]);

  const hasExactMatch = useMemo(() => {
    if (!search.trim()) return false;
    return inventoryItems.some(
      (i) => i.name.toLowerCase() === search.toLowerCase().trim()
    );
  }, [search, inventoryItems]);

  // Add an existing inventory item to shopping list (for restocking)
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

  // Open the new product form
  const handleAddNew = () => {
    setNewName(search.trim());
    setShowNewForm(true);
  };

  // Save new product to shopping list
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
      <Card className="ring-2 ring-primary/30">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Add New Product</h3>
          <p className="text-xs text-muted-foreground">
            This product will be added to the Google Sheet when you check it off.
          </p>

          <Input
            placeholder="Product name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newStorage} onValueChange={(v) => setNewStorage(v as StorageLocation)}>
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
                value={newQty}
                onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
                step="0.5" min="0" inputMode="decimal"
                className="h-8 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Unit</label>
              <Select value={newUnit} onValueChange={(v) => setNewUnit(v as Unit)}>
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
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="h-8 text-sm mt-0.5"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowNewForm(false)}>
              Back
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSaveNew} disabled={!newName.trim()}>
              Add to Shopping List
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ring-2 ring-primary/30">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Add to Shopping List</h3>
        <p className="text-xs text-muted-foreground">
          Search for an existing product to restock, or add a new one.
        </p>

        {/* Search Field */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Type product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Search Results */}
        {search.trim() && (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filteredItems.length > 0 ? (
              <>
                <p className="text-[11px] text-muted-foreground">
                  {filteredItems.length} matching products — tap to add to list
                </p>
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectExisting(item)}
                    className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0', getCategoryColor(item.category))}>
                      {getProductIcon(item.name, item.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.category} · Have {item.qtyOnHand} {item.unit}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      {item.needToBuy > 0 && (
                        <Badge variant="danger" className="text-[10px]">
                          Need {item.needToBuy}
                        </Badge>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No matching products found.</p>
            )}

            {/* Add as New Product button */}
            {!hasExactMatch && search.trim().length >= 2 && (
              <button
                onClick={handleAddNew}
                className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-lg border-2 border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">Add "{search.trim()}" as new product</p>
                  <p className="text-[11px] text-muted-foreground">Creates a new row in Google Sheet</p>
                </div>
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
