import { useState, useEffect } from 'react';
import { useStore } from '../store';
import CustomerDetail from './CustomerDetail';

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { token, customers, setCustomers, addCustomer } = useStore();

  useEffect(() => {
    fetchCustomers();
  }, [filter, sortBy, token]);

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ebay_username: newCustomer, notes }),
      });

      if (response.ok) {
        const data = await response.json();
        addCustomer(data);
        setNewCustomer('');
        setNotes('');
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedCustomerId) {
    return (
      <CustomerDetail
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Customers</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Add Customer</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label htmlFor="ebay_username" className="block text-sm font-medium text-gray-300">
                  eBay Username
                </label>
                <input
                  id="ebay_username"
                  type="text"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="ebay_username"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Customer notes"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-900 hover:shadow-md hover:shadow-blue-400/60 text-white font-semibold rounded-md disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Customer'}
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Filters & Sort</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="filter" className="block text-sm font-medium text-gray-300 mb-2">
                  Filter By
                </label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="all">All Customers</option>
                  <option value="return_customers">Return Customers</option>
                  <option value="best_customers">Best Customers</option>
                </select>
              </div>

              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">None</option>
                  <option value="lifetime_amount">Lifetime Amount</option>
                  <option value="average_ticket">Average Ticket</option>
                  <option value="purchase_count">Purchase Count</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700 border-b-gray-600 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-100">Username</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-100">Purchases</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-100">Spent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-100">Avg Ticket</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-100">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-100">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-700">
                      <td className="px-6 py-3 text-sm text-gray-100">{customer.ebay_username}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">{customer.purchase_count}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        ${parseFloat(customer.lifetime_spent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">
                        ${parseFloat(customer.average_ticket || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {customer.is_return_customer ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            Repeat
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-100 rounded text-xs">
                            New
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
