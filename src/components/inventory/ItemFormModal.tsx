import { useState, useEffect } from 'react';
import type { GroceryItem } from '../../types';
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from '../../types';
import { Modal } from '../shared/Modal';

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
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }
  }, [isOpen, item]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Required';
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
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'Edit Item' : 'Add Item'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Item Name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. White Rice"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })}
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Storage">
            <select
              value={form.storage}
              onChange={(e) => setForm({ ...form, storage: e.target.value as typeof form.storage })}
              className="input-field"
            >
              {STORAGE_LOCATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Qty on Hand" error={errors.qtyOnHand}>
            <input
              type="number"
              value={form.qtyOnHand}
              onChange={(e) => setForm({ ...form, qtyOnHand: parseFloat(e.target.value) || 0 })}
              className="input-field"
              step="0.5"
              min="0"
              inputMode="decimal"
            />
          </Field>
          <Field label="Unit">
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value as typeof form.unit })}
              className="input-field"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Min Level" error={errors.minLevel}>
            <input
              type="number"
              value={form.minLevel}
              onChange={(e) => setForm({ ...form, minLevel: parseFloat(e.target.value) || 0 })}
              className="input-field"
              step="0.5"
              min="0"
              inputMode="decimal"
            />
          </Field>
          <Field label="Restock To" error={errors.restockTo}>
            <input
              type="number"
              value={form.restockTo}
              onChange={(e) => setForm({ ...form, restockTo: parseFloat(e.target.value) || 0 })}
              className="input-field"
              step="0.5"
              min="0"
              inputMode="decimal"
            />
          </Field>
        </div>

        <Field label="Notes">
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-field"
            placeholder="Optional notes"
          />
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium active:bg-primary-dark"
          >
            {item ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
