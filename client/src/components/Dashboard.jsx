import { useState } from 'react';
import Navigation from './Navigation';
import DashboardHome from './DashboardHome';
import CustomersPage from './CustomersPage';
import SalesPage from './SalesPage';
import InventoryPage from './InventoryPage';
import EbaySyncPage from './EbaySyncPage';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <DashboardHome />;
      case 'customers':
        return <CustomersPage />;
      case 'sales':
        return <SalesPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'ebay':
        return <EbaySyncPage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
}
