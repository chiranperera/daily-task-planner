import type { ItemStatus } from '../../types';

const statusStyles: Record<ItemStatus, string> = {
  'LOW STOCK': 'bg-red-100 text-red-700 border-red-200',
  'WATCH': 'bg-amber-100 text-amber-700 border-amber-200',
  'OK': 'bg-green-100 text-green-700 border-green-200',
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
