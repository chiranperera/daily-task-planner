import type { GroceryItem } from '../types';

const CSV_HEADERS = [
  'Item',
  'Category',
  'Storage',
  'Qty On Hand',
  'Unit',
  'Min Level',
  'Restock To',
  'Last Updated',
  'Notes',
];

export function exportToCsv(items: GroceryItem[]): void {
  const rows = items.map((item) =>
    [
      item.name,
      item.category,
      item.storage,
      item.qtyOnHand,
      item.unit,
      item.minLevel,
      item.restockTo,
      item.lastUpdated,
      item.notes,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv = [CSV_HEADERS.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grocery-inventory-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromCsv(file: File): Promise<Omit<GroceryItem, 'id'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const items: Omit<GroceryItem, 'id'>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].match(/(".*?"|[^,]+)/g)?.map((c) =>
            c.replace(/^"|"$/g, '').replace(/""/g, '"')
          );
          if (!cols || cols.length < 7) continue;

          items.push({
            name: cols[0],
            category: cols[1] as GroceryItem['category'],
            storage: cols[2] as GroceryItem['storage'],
            qtyOnHand: parseFloat(cols[3]) || 0,
            unit: cols[4] as GroceryItem['unit'],
            minLevel: parseFloat(cols[5]) || 0,
            restockTo: parseFloat(cols[6]) || 0,
            lastUpdated: cols[7] || new Date().toISOString().split('T')[0],
            notes: cols[8] || '',
          });
        }
        resolve(items);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
