interface SummaryCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export function SummaryCard({ label, value, color, icon }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-gray-300">{icon}</div>
      </div>
    </div>
  );
}
