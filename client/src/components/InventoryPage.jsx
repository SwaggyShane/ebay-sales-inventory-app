import { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useStore();

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const handleSetInventory = async (e) => {
    e.preventDefault();
    if (!selectedType || quantity === '') {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/set/${selectedType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: parseInt(quantity),
          reason: reason || 'Manual update',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(inventory.map((inv) => (inv.id === data.id ? data : inv)));
        setQuantity('');
        setReason('');
      }
    } catch (error) {
      console.error('Failed to set inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustQuantity = async (type, change) => {
    try {
      const response = await fetch(`/api/inventory/adjust/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity_change: change,
          reason: 'Quick adjustment',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(inventory.map((inv) => (inv.id === data.id ? data : inv)));
      }
    } catch (error) {
      console.error('Failed to adjust inventory:', error);
    }
  };

  const handleViewHistory = async (type) => {
    try {
      const response = await fetch(`/api/inventory/history/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAdjustmentHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const inventoryTypes = ['Purple Mystery Snails', 'Magenta Mystery Snails'];

  const currentItem = inventory.find((inv) => inv.item_type === selectedType);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventoryTypes.map((type) => {
          const item = inventory.find((inv) => inv.item_type === type);
          return (
            <div key={type} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{type}</h3>
              {item ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-gray-600 text-xs font-semibold uppercase">Stock</div>
                      <div className="text-3xl font-bold text-gray-800 mt-2">{item.quantity}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 text-xs font-semibold uppercase">Reserved</div>
                      <div className="text-3xl font-bold text-gray-800 mt-2">{item.reserved_quantity || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 text-xs font-semibold uppercase">Available</div>
                      <div className="text-3xl font-bold text-green-600 mt-2">
                        {item.quantity - (item.reserved_quantity || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleAdjustQuantity(type, 1)}
                      className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleAdjustQuantity(type, -1)}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md transition"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => {
                        setSelectedType(type);
                        handleViewHistory(type);
                      }}
                      className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition text-sm"
                    >
                      History
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">No inventory data</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Manual Inventory Update</h2>
        <form onSubmit={handleSetInventory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">
                Item Type
              </label>
              <select
                id="itemType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select type</option>
                {inventoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason (Optional)
              </label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Recount, new shipment, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set Inventory'}
          </button>
        </form>
      </div>

      {adjustmentHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Adjustment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Reason</th>
                </tr>
              </thead>
              <tbody>
                {adjustmentHistory.map((adj) => (
                  <tr key={adj.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(adj.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-800">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {adj.adjustment_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold">
                      <span className={adj.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{adj.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
