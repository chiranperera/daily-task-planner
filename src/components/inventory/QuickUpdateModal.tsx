import { useState } from 'react';
import type { GroceryItemWithStatus } from '../../types';
import { Modal } from '../shared/Modal';
import { StatusBadge } from '../shared/StatusBadge';

interface QuickUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GroceryItemWithStatus | null;
  onSave: (id: string, qty: number) => void;
}

export function QuickUpdateModal({ isOpen, onClose, item, onSave }: QuickUpdateModalProps) {
  const [qty, setQty] = useState(0);

  if (!item) return null;

  const handleOpen = () => setQty(item.qtyOnHand);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Quantity">
      <div onAnimationEnd={handleOpen}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <p className="text-xs text-gray-500">{item.category} · {item.storage}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 text-center mb-3">Quantity on Hand ({item.unit})</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQty(Math.max(0, qty - 0.5))}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 active:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-20 text-center text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-primary focus:outline-none"
              step="0.5"
              min="0"
              inputMode="decimal"
            />
            <button
              onClick={() => setQty(qty + 0.5)}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-700 active:bg-gray-100"
            >
              +
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
            <span>Min: {item.minLevel}</span>
            <span>Restock: {item.restockTo}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(item.id, qty);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium active:bg-primary-dark"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
