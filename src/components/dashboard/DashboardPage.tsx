import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Eye, ShoppingCart, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventoryContext } from '@/context/InventoryContext';
import { getProductIcon } from '@/lib/product-icons';
import type { ItemStatus } from '@/types';
import { cn } from '@/lib/utils';

type DashboardFilter = 'all' | 'low' | 'watch' | 'buy' | 'ok';

const filterConfig: Record<DashboardFilter, { label: string; color: string; activeColor: string; borderColor: string }> = {
  all: { label: 'Tracked Items', color: 'text-blue-600', activeColor: 'bg-blue-50 ring-2 ring-blue-400', borderColor: 'border-l-blue-500' },
  low: { label: 'Low Stock', color: 'text-red-600', activeColor: 'bg-red-50 ring-2 ring-red-400', borderColor: 'border-l-red-500' },
  watch: { label: 'Watch List', color: 'text-amber-600', activeColor: 'bg-amber-50 ring-2 ring-amber-400', borderColor: 'border-l-amber-500' },
  buy: { label: 'Units to Buy', color: 'text-orange-600', activeColor: 'bg-orange-50 ring-2 ring-orange-400', borderColor: 'border-l-orange-500' },
  ok: { label: 'Items OK', color: 'text-emerald-600', activeColor: 'bg-emerald-50 ring-2 ring-emerald-400', borderColor: 'border-l-emerald-500' },
};

const statusBadgeVariant: Record<ItemStatus, 'danger' | 'warning' | 'success'> = {
  'LOW STOCK': 'danger',
  'WATCH': 'warning',
  'OK': 'success',
};

export function DashboardPage() {
  const { items, stats, shoppingList } = useInventoryContext();
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
    <div className="px-4 py-5 space-y-5">
      <h2 className="text-lg font-bold text-foreground">Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ key, value, icon: Icon }) => {
          const cfg = filterConfig[key];
          const isActive = activeFilter === key;
          return (
            <Card
              key={key}
              className={cn(
                'cursor-pointer transition-all border-l-4 hover:shadow-md',
                cfg.borderColor,
                isActive && cfg.activeColor,
                key === 'ok' && 'col-span-2'
              )}
              onClick={() => toggleFilter(key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{cfg.label}</p>
                    <p className={cn('text-2xl font-bold mt-1', cfg.color)}>{value}</p>
                  </div>
                  <Icon className={cn('w-7 h-7', isActive ? cfg.color : 'text-gray-300')} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtered Items List */}
      {activeFilter && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {filterConfig[activeFilter].label}
              <span className="text-muted-foreground font-normal ml-1">({filteredItems.length})</span>
            </h3>
            <button
              onClick={() => setActiveFilter(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg flex-shrink-0">
                    {getProductIcon(item.name, item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{item.qtyOnHand} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span></p>
                    <Badge variant={statusBadgeVariant[item.status]} className="text-[10px] mt-0.5">
                      {item.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access - Low Stock Alert */}
      {!activeFilter && shoppingList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Needs Attention</h3>
            <Link to="/shopping" className="text-xs font-medium text-primary hover:underline">
              View Shopping List
            </Link>
          </div>
          <div className="space-y-2">
            {shoppingList.slice(0, 6).map((item) => (
              <Card key={item.id} className="border-l-4 border-l-red-400">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-lg flex-shrink-0">
                    {getProductIcon(item.name, item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.qtyOnHand} {item.unit} left
                    </p>
                  </div>
                  <Badge variant="danger" className="text-xs">
                    Need {item.needToBuy}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          {shoppingList.length > 6 && (
            <Link to="/shopping" className="block text-center text-sm text-primary font-medium py-2 hover:underline">
              +{shoppingList.length - 6} more items
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
