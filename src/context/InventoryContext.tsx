import { createContext, useContext, type ReactNode } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useShoppingList } from '@/hooks/useShoppingList';

type InventoryContextType = ReturnType<typeof useInventory> & {
  shopping: ReturnType<typeof useShoppingList>;
};

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const inventory = useInventory();
  const shopping = useShoppingList();
  return (
    <InventoryContext.Provider value={{ ...inventory, shopping }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext(): InventoryContextType {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventoryContext must be used within InventoryProvider');
  return ctx;
}
