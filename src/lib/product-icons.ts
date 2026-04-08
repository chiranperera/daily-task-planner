import type { Category } from '@/types';

const ITEM_ICONS: Record<string, string> = {
  // Grains & Staples
  'white rice': '\u{1F35A}', 'red rice': '\u{1F35A}', 'basmati rice': '\u{1F35A}', 'suvadal rice': '\u{1F35A}',
  'rice': '\u{1F35A}', 'rice flour': '\u{1F35A}', 'string hoppers flour': '\u{1F35A}',
  'dhal': '\u{1F372}', 'lentil': '\u{1F372}',
  'pasta': '\u{1F35D}', 'noodles': '\u{1F35C}', 'harischandra noodles': '\u{1F35C}',
  'flour': '\u{1F33E}', 'dosai flour': '\u{1F33E}',
  'bread': '\u{1F35E}',
  // Breakfast
  'oats': '\u{1F963}', 'cornflakes': '\u{1F963}', 'cereal': '\u{1F963}',
  'milk powder': '\u{1F95B}', 'milk': '\u{1F95B}',
  'tea': '\u{1F375}', 'coffee': '\u2615',
  'sugar': '\u{1F36C}',
  'egg': '\u{1F95A}', 'eggs': '\u{1F95A}',
  'jam': '\u{1F353}',
  // Dinner / Canned
  'canned beans': '\u{1F96B}', 'canned tomatoes': '\u{1F345}', 'canned tuna': '\u{1F41F}', 'canned corn': '\u{1F33D}',
  'beans': '\u{1F96B}', 'tuna': '\u{1F41F}',
  // Produce
  'soyameat': '\u{1F356}', 'onions': '\u{1F9C5}', 'onion': '\u{1F9C5}',
  'garlic': '\u{1F9C4}', 'potatoes': '\u{1F954}', 'potato': '\u{1F954}',
  'carrots': '\u{1F955}', 'carrot': '\u{1F955}',
  'bananas': '\u{1F34C}', 'banana': '\u{1F34C}',
  'lemons': '\u{1F34B}', 'lemon': '\u{1F34B}',
  'tomato': '\u{1F345}', 'tomatoes': '\u{1F345}',
  'apple': '\u{1F34E}', 'apples': '\u{1F34E}',
  'chicken': '\u{1F357}', 'meat': '\u{1F356}', 'fish': '\u{1F41F}',
  // Cooking Essentials
  'coconut oil': '\u{1F965}', 'coconut milk': '\u{1F965}', 'coconut': '\u{1F965}',
  'olive oil': '\u{1FAD2}', 'oil': '\u{1FAD2}', 'vegetable oil': '\u{1FAD2}',
  'soya sauce': '\u{1F958}', 'soy sauce': '\u{1F958}', 'fish sauce': '\u{1F958}',
  'salt': '\u{1F9C2}', 'pepper': '\u{1F336}\uFE0F', 'black pepper': '\u{1F336}\uFE0F',
  'chilli powder': '\u{1F336}\uFE0F', 'chilli': '\u{1F336}\uFE0F',
  'turmeric': '\u{1F7E1}', 'curry powder': '\u{1F7E0}', 'curry': '\u{1F35B}',
  'vinegar': '\u{1F9EA}',
  'tomato sauce': '\u{1F345}', 'ketchup': '\u{1F345}',
  'mustard': '\u{1F7E1}',
  'butter': '\u{1F9C8}', 'cheese': '\u{1F9C0}',
  'water': '\u{1F4A7}',
};

const CATEGORY_ICONS: Record<Category, string> = {
  'Grains & Staples': '\u{1F33E}',
  'Breakfast': '\u{1F963}',
  'Dinner': '\u{1F372}',
  'Produce': '\u{1F966}',
  'Cooking Essentials': '\u{1F9C2}',
};

const CATEGORY_COLORS: Record<Category, string> = {
  'Grains & Staples': 'bg-amber-100',
  'Breakfast': 'bg-orange-100',
  'Dinner': 'bg-red-100',
  'Produce': 'bg-green-100',
  'Cooking Essentials': 'bg-purple-100',
};

export function getProductIcon(name: string, category: Category): string {
  const lower = name.toLowerCase().trim();
  if (ITEM_ICONS[lower]) return ITEM_ICONS[lower];
  for (const [key, icon] of Object.entries(ITEM_ICONS)) {
    if (lower.includes(key) || key.includes(lower)) return icon;
  }
  return CATEGORY_ICONS[category] || '\u{1F6D2}';
}

export function getCategoryColor(category: Category): string {
  return CATEGORY_COLORS[category] || 'bg-gray-100';
}
