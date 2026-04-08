import { useState, useRef } from 'react';
import type { GroceryItemWithStatus, GroceryItem } from '../../types';
import { useInventoryContext } from '../../context/InventoryContext';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { InventoryCard } from './InventoryCard';
import { QuickUpdateModal } from './QuickUpdateModal';
import { ItemFormModal } from './ItemFormModal';
import { EmptyState } from '../shared/EmptyState';
import { exportToCsv, importFromCsv } from '../../lib/csv';

export function InventoryPage() {
  const { items, filteredItems, filters, dispatch } = useInventoryContext();
  const [quickUpdateItem, setQuickUpdateItem] = useState<GroceryItemWithStatus | null>(null);
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<GroceryItemWithStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickSave = (id: string, qty: number) => {
    dispatch({ type: 'QUICK_UPDATE_QTY', id, qty });
  };

  const handleAddSave = (data: Omit<GroceryItem, 'id' | 'lastUpdated'>) => {
    dispatch({ type: 'ADD_ITEM', item: data });
  };

  const handleEditSave = (data: Omit<GroceryItem, 'id' | 'lastUpdated'>) => {
    if (editItem) {
      dispatch({ type: 'EDIT_ITEM', id: editItem.id, updates: data });
    }
  };

  const handleDelete = () => {
    if (deleteItem) {
      dispatch({ type: 'DELETE_ITEM', id: deleteItem.id });
      setDeleteItem(null);
    }
  };

  const handleExport = () => {
    const rawItems = items.map(({ status: _s, needToBuy: _n, ...rest }) => rest);
    exportToCsv(rawItems);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromCsv(file);
      dispatch({ type: 'IMPORT_ITEMS', items: imported });
    } catch {
      alert('Failed to import CSV. Please check the file format.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="px-4 py-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">Inventory</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="text-xs text-primary font-medium px-2 py-1 border border-primary/20 rounded-lg hover:bg-primary/5"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-primary font-medium px-2 py-1 border border-primary/20 rounded-lg hover:bg-primary/5"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <SearchBar
          value={filters.search}
          onChange={(search) => dispatch({ type: 'SET_FILTERS', filters: { search } })}
        />
        <FilterBar
          filters={filters}
          onChange={(f) => dispatch({ type: 'SET_FILTERS', filters: f })}
        />
      </div>

      <p className="text-xs text-gray-400 mb-3">
        {filteredItems.length} of {items.length} items
      </p>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          title="No items found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onQuickUpdate={setQuickUpdateItem}
              onEdit={(i) => setEditItem(i)}
              onDelete={setDeleteItem}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-18 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:bg-primary-dark z-20"
      >
        +
      </button>

      {/* Modals */}
      <QuickUpdateModal
        isOpen={!!quickUpdateItem}
        onClose={() => setQuickUpdateItem(null)}
        item={quickUpdateItem}
        onSave={handleQuickSave}
      />

      <ItemFormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSave={handleAddSave}
      />

      <ItemFormModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteItem(null)} />
          <div className="relative bg-white rounded-xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteItem.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
