import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from '@/context/InventoryContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { InventoryPage } from '@/components/inventory/InventoryPage';
import { ShoppingListPage } from '@/components/shopping/ShoppingListPage';
import { SettingsPage } from '@/components/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <div className="flex flex-col min-h-dvh bg-background">
          <Header />
          <main className="flex-1 pb-16 max-w-lg mx-auto w-full">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/shopping" element={<ShoppingListPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
