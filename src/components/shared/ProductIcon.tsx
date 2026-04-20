import { cn } from '@/lib/utils';

interface ProductIconProps {
  category: string;
  name?: string;
  className?: string;
}

function initials(str: string): string {
  const words = str.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '·';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function ProductIcon({ category, name, className }: ProductIconProps) {
  const label = name ? initials(name) : category[0]?.toUpperCase() ?? '·';
  return (
    <div
      className={cn(
        'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0',
        'bg-neutral-100 border border-neutral-200 text-neutral-700',
        'text-[10px] font-semibold tracking-wide',
        className
      )}
      aria-hidden
    >
      {label}
    </div>
  );
}
