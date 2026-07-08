import { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    item_title: '',
    quantity: 1,
    price: 0,
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const { token, sales: storeSales, setSales: setStoreSales, addSale, deleteSale } = useStore();

  useEffect(() => {
    Promise.all([fetchSales(), fetchCustomers()]);
  }, [token]);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSales(data);
        setStoreSales(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.item_title) {
      alert('Please fill in required fields');
      return;
    }

    const total_amount = formData.quantity * formData.price;

    setLoading(true);
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          item_title: formData.item_title,
          quantity: formData.quantity,
          price: formData.price,
          total_amount,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addSale(data);
        setSales([data, ...sales]);
        setFormData({
          customer_id: '',
          item_title: '',
          quantity: 1,
          price: 0,
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to add sale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        deleteSale(saleId);
        setSales(sales.filter((s) => s.id !== saleId));
      }
    } catch (error) {
      console.error('Failed to delete sale:', error);
    }
  };

  const total_amount = formData.quantity * formData.price;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Sales</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Add Sale</h2>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div>
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-300">
                  Customer *
                </label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.ebay_username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="item_title" className="block text-sm font-medium text-gray-300">
                  Item Title *
                </label>
                <input
                  id="item_title"
                  type="text"
                  name="item_title"
                  value={formData.item_title}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Item name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                    Price
                  </label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-md border border-blue-500/30">
                <div className="text-sm text-gray-400">Total:</div>
                <div className="text-2xl font-bold text-blue-400">${total_amount.toFixed(2)}</div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Sale notes"
                  rows="2"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:shadow-xl hover:shadow-blue-500 text-white font-semibold rounded-md disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Sale'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-100">Recent Sales</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                        No sales found
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-700">
                        <td className="px-6 py-3 text-sm text-gray-400">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-100">{sale.ebay_username}</td>
                        <td className="px-6 py-3 text-sm text-gray-400">{sale.item_title}</td>
                        <td className="px-6 py-3 text-sm text-gray-400">{sale.quantity}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-100">
                          ${parseFloat(sale.total_amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="text-red-500 hover:text-red-200 font-medium"
                          >
                            Delete
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
    </div>
  );
}
