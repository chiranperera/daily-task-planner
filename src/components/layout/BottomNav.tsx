import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Settings } from 'lucide-react';
import { useInventoryContext } from '@/context/InventoryContext';
import { cn } from '@/lib/utils';

const tabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/shopping', label: 'Shopping', icon: ShoppingBag },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const { shoppingList } = useInventoryContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 safe-bottom">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 relative transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {tab.to === '/shopping' && shoppingList.length > 0 && (
              <span className="absolute -top-0.5 right-1 bg-destructive text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {shoppingList.length}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
