import { useStore } from '../store';

export default function Navigation({ currentPage, setCurrentPage }) {
  const { user, logout } = useStore();

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'customers', label: 'Customers' },
    { id: 'sales', label: 'Sales' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'ebay', label: 'eBay Sync' },
  ];

  return (
    <nav className="bg-gray-800 shadow-md border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-400">eBay Sales</div>
            <div className="text-xs text-gray-400 font-medium">{user?.email}</div>
          </div>

          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === item.id
                    ? 'bg-blue-900 text-blue-200'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={logout}
              className="ml-4 px-4 py-2 bg-red-600 hover:shadow-lg hover:shadow-red-600/50 text-white text-sm font-medium rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
