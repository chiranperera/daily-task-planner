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
  const { shopping } = useInventoryContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-30 safe-bottom">
      <div className="flex justify-around items-stretch h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 flex-1 relative transition-colors',
                isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className={cn('w-[18px] h-[18px]', isActive ? 'stroke-[2.2]' : 'stroke-[1.6]')}
                />
                <span
                  className={cn(
                    'text-[10px] tracking-wide',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 bg-neutral-900 rounded-full" />
                )}
                {tab.to === '/shopping' && shopping.uncheckedItems.length > 0 && (
                  <span className="absolute top-2 right-1/2 translate-x-[14px] bg-neutral-900 text-white text-[9px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center tabular-nums">
                    {shopping.uncheckedItems.length}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
