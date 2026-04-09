import { cn } from '@/lib/utils';
import { getCategoryDotColor } from '@/lib/product-icons';

interface ProductIconProps {
  category: string;
  className?: string;
}

export function ProductIcon({ category, className }: ProductIconProps) {
  return (
    <div
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        'bg-gray-100'
      , className)}
    >
      <div className={cn('w-4 h-4 rounded-sm', getCategoryDotColor(category))} />
    </div>
  );
}
