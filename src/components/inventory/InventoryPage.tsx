import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Download, Upload } from 'lucide-react';
import type { GroceryItem, GroceryItemWithStatus } from '@/types';
import { CATEGORIES, STATUSES } from '@/types';
import { useInventoryContext } from '@/context/InventoryContext';
import { InventoryCard } from './InventoryCard';
import { ItemFormModal } from './ItemFormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { exportToCsv, importFromCsv } from '@/lib/csv';

export function InventoryPage() {
  const { items, filteredItems, filters, dispatch, addItem } = useInventoryContext();
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<GroceryItemWithStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      dispatch({ type: 'REORDER', activeId: String(active.id), overId: String(over.id) });
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    dispatch({ type: 'QUICK_UPDATE_QTY', id, qty });
  };

  const handleAddSave = (data: Omit<GroceryItem, 'id' | 'lastUpdated'>) => {
    addItem(data);
  };

  const handleEditSave = (data: Omit<GroceryItem, 'id' | 'lastUpdated'>) => {
    if (editItem) dispatch({ type: 'EDIT_ITEM', id: editItem.id, updates: data });
  };

  const handleDelete = () => {
    if (deleteItem) {
      dispatch({ type: 'DELETE_ITEM', id: deleteItem.id });
      setDeleteItem(null);
    }
  };

  const handleExport = () => {
    const raw = items.map(({ status: _s, needToBuy: _n, ...rest }) => rest);
    exportToCsv(raw);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromCsv(file);
      dispatch({ type: 'IMPORT_ITEMS', items: imported });
    } catch {
      alert('Failed to import CSV.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="px-5 py-6 pb-4">
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Catalog
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-1">
            Inventory
          </h2>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleExport}>
            <Download className="w-3.5 h-3.5" />
            <span className="text-xs">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="text-xs">Import</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Input
          placeholder="Search items"
          value={filters.search}
          onChange={(e) => dispatch({ type: 'SET_FILTERS', filters: { search: e.target.value } })}
        />
        <div className="flex gap-2">
          <Select
            value={filters.category}
            onValueChange={(v) =>
              dispatch({ type: 'SET_FILTERS', filters: { category: v as typeof filters.category } })
            }
          >
            <SelectTrigger className="h-9 text-xs flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(v) =>
              dispatch({ type: 'SET_FILTERS', filters: { status: v as typeof filters.status } })
            }
          >
            <SelectTrigger className="h-9 text-xs flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All status</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400 mb-3 tabular-nums">
        {filteredItems.length} of {items.length} items
      </p>

      {filteredItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
          <p className="text-sm font-medium text-neutral-900">No items found</p>
          <p className="text-xs text-neutral-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {filteredItems.map((item) => (
                <InventoryCard
                  key={item.id}
                  item={item}
                  onEdit={(i) => setEditItem(i)}
                  onDelete={setDeleteItem}
                  onQtyChange={handleQtyChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* FAB */}
      <Button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full shadow-lg z-20 p-0 bg-neutral-900 hover:bg-neutral-800"
        size="icon"
        aria-label="Add item"
      >
        <Plus className="w-5 h-5" />
      </Button>

      <ItemFormModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSave={handleAddSave} />
      <ItemFormModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        onSave={handleEditSave}
      />

      <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <DialogContent className="mx-4 max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              Delete <strong className="text-neutral-900">{deleteItem?.name}</strong>? This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
