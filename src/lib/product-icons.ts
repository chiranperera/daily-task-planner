import type { Category } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
  'Grains & Staples': 'bg-amber-500',
  'Breakfast': 'bg-orange-500',
  'Dinner': 'bg-red-500',
  'Produce': 'bg-green-500',
  'Cooking Essentials': 'bg-purple-500',
};

const CATEGORY_BG: Record<string, string> = {
  'Grains & Staples': 'bg-amber-100',
  'Breakfast': 'bg-orange-100',
  'Dinner': 'bg-red-100',
  'Produce': 'bg-green-100',
  'Cooking Essentials': 'bg-purple-100',
};

export function getCategoryColor(category: Category | string): string {
  return CATEGORY_BG[category] || 'bg-gray-100';
}

export function getCategoryDotColor(category: Category | string): string {
  return CATEGORY_COLORS[category] || 'bg-gray-400';
}
