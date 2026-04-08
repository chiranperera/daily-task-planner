import type { GroceryItem } from '../types';

export const SEED_DATA: GroceryItem[] = [
  // === Grains & Staples ===
  { id: 'seed-001', name: 'White Rice', category: 'Grains & Staples', storage: 'Storage', qtyOnHand: 3, unit: 'pcs', minLevel: 4, restockTo: 6, lastUpdated: '2026-04-02', notes: 'Main family staple' },
  { id: 'seed-002', name: 'Red Rice', category: 'Grains & Staples', storage: 'Pantry', qtyOnHand: 0.5, unit: 'pcs', minLevel: 1, restockTo: 1, lastUpdated: '2026-04-03', notes: 'Main family staple' },
  { id: 'seed-003', name: 'Dhal', category: 'Grains & Staples', storage: 'Pantry', qtyOnHand: 1, unit: 'kg', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: 'Finished' },
  { id: 'seed-004', name: 'Basmati Rice', category: 'Grains & Staples', storage: 'Storage', qtyOnHand: 2, unit: 'pcs', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: 'For biryani' },
  { id: 'seed-005', name: 'String Hoppers Flour', category: 'Grains & Staples', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-006', name: 'Rice Flour', category: 'Grains & Staples', storage: 'Pantry', qtyOnHand: 0.5, unit: 'kg', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },

  // === Breakfast ===
  { id: 'seed-007', name: 'Suvadal Rice', category: 'Breakfast', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 2, restockTo: 2, lastUpdated: '2026-04-04', notes: 'Main family staple' },
  { id: 'seed-008', name: 'Oats', category: 'Breakfast', storage: 'Pantry', qtyOnHand: 0, unit: 'pcs', minLevel: 0, restockTo: 1, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-009', name: 'Cornflakes', category: 'Breakfast', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: 'Kids breakfast' },
  { id: 'seed-010', name: 'Milk Powder', category: 'Breakfast', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-011', name: 'Tea', category: 'Breakfast', storage: 'Pantry', qtyOnHand: 2, unit: 'pcs', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-012', name: 'Sugar', category: 'Breakfast', storage: 'Pantry', qtyOnHand: 2, unit: 'kg', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: '' },

  // === Dinner ===
  { id: 'seed-013', name: 'Pasta', category: 'Dinner', storage: 'Storage', qtyOnHand: 3, unit: 'pcs', minLevel: 2, restockTo: 4, lastUpdated: '2026-04-02', notes: 'Red + yellow mix' },
  { id: 'seed-014', name: 'Harischandra Noodles', category: 'Dinner', storage: 'Storage', qtyOnHand: 2, unit: 'pcs', minLevel: 2, restockTo: 4, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-015', name: 'Flour', category: 'Dinner', storage: 'Storage', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-016', name: 'Dosai Flour', category: 'Dinner', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 1, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-017', name: 'Canned Beans', category: 'Dinner', storage: 'Storage', qtyOnHand: 3, unit: 'pcs', minLevel: 2, restockTo: 4, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-018', name: 'Canned Tomatoes', category: 'Dinner', storage: 'Storage', qtyOnHand: 2, unit: 'pcs', minLevel: 2, restockTo: 4, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-019', name: 'Canned Tuna', category: 'Dinner', storage: 'Storage', qtyOnHand: 3, unit: 'pcs', minLevel: 2, restockTo: 4, lastUpdated: '2026-04-02', notes: '' },

  // === Produce ===
  { id: 'seed-020', name: 'Soyameat', category: 'Produce', storage: 'Storage', qtyOnHand: 6, unit: 'pcs', minLevel: 2, restockTo: 6, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-021', name: 'Onions', category: 'Produce', storage: 'Pantry', qtyOnHand: 2, unit: 'kg', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-022', name: 'Garlic', category: 'Produce', storage: 'Pantry', qtyOnHand: 0.5, unit: 'kg', minLevel: 0.5, restockTo: 1, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-023', name: 'Potatoes', category: 'Produce', storage: 'Storage', qtyOnHand: 2, unit: 'kg', minLevel: 2, restockTo: 5, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-024', name: 'Carrots', category: 'Produce', storage: 'Pantry', qtyOnHand: 1, unit: 'kg', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-025', name: 'Bananas', category: 'Produce', storage: 'Pantry', qtyOnHand: 6, unit: 'pcs', minLevel: 3, restockTo: 8, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-026', name: 'Lemons', category: 'Produce', storage: 'Pantry', qtyOnHand: 3, unit: 'pcs', minLevel: 2, restockTo: 5, lastUpdated: '2026-04-02', notes: '' },

  // === Cooking Essentials ===
  { id: 'seed-027', name: 'Coconut Oil', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'bottles', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-028', name: 'Coconut Milk', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 8, unit: 'bottles', minLevel: 2, restockTo: 6, lastUpdated: '2026-04-02', notes: 'Kids breakfast' },
  { id: 'seed-029', name: 'Soya Sauce', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'bottles', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-030', name: 'Fish Sauce', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'bottles', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-031', name: 'Salt', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 3, unit: 'packs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-032', name: 'Black Pepper', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-033', name: 'Chilli Powder', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-034', name: 'Turmeric', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'pcs', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-035', name: 'Curry Powder', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 2, unit: 'pcs', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-036', name: 'Vinegar', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'bottles', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-037', name: 'Tomato Sauce', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 2, unit: 'bottles', minLevel: 1, restockTo: 3, lastUpdated: '2026-04-02', notes: '' },
  { id: 'seed-038', name: 'Mustard', category: 'Cooking Essentials', storage: 'Pantry', qtyOnHand: 1, unit: 'bottles', minLevel: 1, restockTo: 2, lastUpdated: '2026-04-02', notes: '' },
];
