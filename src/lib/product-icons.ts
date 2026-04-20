import type { Category } from '@/types';

// Monochrome design — we keep these helpers for compatibility, but every
// category maps to the same neutral tone. Visual hierarchy comes from
// typography and layout, not color.

export function getCategoryColor(_category: Category | string): string {
  return 'bg-neutral-100';
}

export function getCategoryDotColor(_category: Category | string): string {
  return 'bg-neutral-900';
}
