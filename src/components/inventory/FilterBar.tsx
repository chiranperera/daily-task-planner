import type { InventoryFilters } from '../../types';
import { CATEGORIES, STATUSES } from '../../types';

interface FilterBarProps {
  filters: InventoryFilters;
  onChange: (filters: Partial<InventoryFilters>) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <FilterChipGroup
        label="Category"
        value={filters.category}
        options={['All', ...CATEGORIES]}
        onChange={(v) => onChange({ category: v as InventoryFilters['category'] })}
      />
      <FilterChipGroup
        label="Status"
        value={filters.status}
        options={['All', ...STATUSES]}
        onChange={(v) => onChange({ status: v as InventoryFilters['status'] })}
      />
    </div>
  );
}

function FilterChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === 'All' ? `${label}: All` : opt}
          </option>
        ))}
      </select>
    </div>
  );
}
