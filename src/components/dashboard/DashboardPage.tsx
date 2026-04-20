import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Eye, ShoppingCart, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useInventoryContext } from '@/context/InventoryContext';
import { ProductIcon } from '@/components/shared/ProductIcon';
import type { ItemStatus } from '@/types';
import { cn } from '@/lib/utils';

type DashboardFilter = 'all' | 'low' | 'watch' | 'buy' | 'ok';

const filterConfig: Record<DashboardFilter, { label: string }> = {
  all: { label: 'Tracked' },
  low: { label: 'Low stock' },
  watch: { label: 'Watch list' },
  buy: { label: 'To buy' },
  ok: { label: 'In stock' },
};

const statusBadgeVariant: Record<ItemStatus, 'danger' | 'warning' | 'success'> = {
  'LOW STOCK': 'danger',
  'WATCH': 'warning',
  'OK': 'success',
};

export function DashboardPage() {
  const { items, stats } = useInventoryContext();
  const lowStockItems = items.filter((i) => i.status === 'LOW STOCK' && i.needToBuy > 0);
  const [activeFilter, setActiveFilter] = useState<DashboardFilter | null>(null);

  const toggleFilter = (filter: DashboardFilter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const filteredItems = activeFilter
    ? items.filter((item) => {
        switch (activeFilter) {
          case 'all': return true;
          case 'low': return item.status === 'LOW STOCK';
          case 'watch': return item.status === 'WATCH';
          case 'buy': return item.needToBuy > 0;
          case 'ok': return item.status === 'OK';
        }
      })
    : [];

  const cards: { key: DashboardFilter; value: number; icon: typeof Package }[] = [
    { key: 'all', value: stats.trackedItems, icon: Package },
    { key: 'low', value: stats.lowStockCount, icon: AlertTriangle },
    { key: 'watch', value: stats.watchCount, icon: Eye },
    { key: 'buy', value: stats.unitsToBuy, icon: ShoppingCart },
    { key: 'ok', value: stats.okCount, icon: CheckCircle },
  ];

  return (
    <div className="px-5 py-6 space-y-8">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
          Overview
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 mt-1">
          At a glance
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {cards.map(({ key, value, icon: Icon }) => {
          const cfg = filterConfig[key];
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={cn(
                'text-left rounded-xl border transition-all p-4',
                isActive
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'bg-white border-neutral-200 hover:border-neutral-300',
                key === 'ok' && 'col-span-2'
              )}
            >
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    'text-[10px] font-medium uppercase tracking-[0.18em]',
                    isActive ? 'text-neutral-400' : 'text-neutral-500'
                  )}
                >
                  {cfg.label}
                </p>
                <Icon
                  className={cn(
                    'w-4 h-4',
                    isActive ? 'text-neutral-500' : 'text-neutral-300'
                  )}
                />
              </div>
              <p
                className={cn(
                  'text-3xl font-semibold tracking-tight mt-3 tabular-nums',
                  isActive ? 'text-white' : 'text-neutral-900'
                )}
              >
                {value}
              </p>
            </button>
          );
        })}
      </div>

      {activeFilter && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">
              {filterConfig[activeFilter].label}
              <span className="text-neutral-400 font-normal ml-1.5 tabular-nums">
                ({filteredItems.length})
              </span>
            </h3>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg"
              >
                <ProductIcon category={item.category} name={item.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-neutral-500">{item.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold tabular-nums">
                    {item.qtyOnHand}
                    <span className="text-[11px] font-normal text-neutral-500 ml-0.5">
                      {item.unit}
                    </span>
                  </p>
                  <Badge variant={statusBadgeVariant[item.status]} className="mt-1">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!activeFilter && lowStockItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Needs attention</h3>
            <Link
              to="/inventory"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              Inventory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {lowStockItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg"
              >
                <ProductIcon category={item.category} name={item.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-neutral-500 tabular-nums">
                    {item.qtyOnHand} {item.unit} left
                  </p>
                </div>
                <Badge variant="danger">Need {item.needToBuy}</Badge>
              </div>
            ))}
          </div>
          {lowStockItems.length > 6 && (
            <Link
              to="/inventory"
              className="block text-center text-xs font-medium text-neutral-500 hover:text-neutral-900 py-2"
            >
              +{lowStockItems.length - 6} more items
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
