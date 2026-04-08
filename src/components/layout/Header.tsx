import { ShoppingCart } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <ShoppingCart className="w-6 h-6" />
        <h1 className="text-lg font-bold tracking-tight">Grocery Tracker</h1>
      </div>
    </header>
  );
}
