import { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [inventoryTypes, setInventoryTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useStore();

  useEffect(() => {
    fetchInventoryTypes();
    fetchInventory();
  }, [token]);

  const fetchInventoryTypes = async () => {
    try {
      const response = await fetch('/api/inventory/types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInventoryTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory types:', error);
    }
  };

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

  const handleViewHistory = async (typeName) => {
    try {
      const response = await fetch(`/api/inventory/history/${typeName}`, {
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

  const handleAddInventoryType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      alert('Please enter a type name');
      return;
    }

    try {
      const response = await fetch('/api/inventory/types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTypeName }),
      });

      if (response.ok) {
        const data = await response.json();
        setInventoryTypes([...inventoryTypes, data]);
        setNewTypeName('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add type');
      }
    } catch (error) {
      console.error('Failed to add type:', error);
      alert('Error adding type');
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!confirm('Delete this fish breed? Associated inventory will not be deleted.')) return;

    try {
      const response = await fetch(`/api/inventory/types/${typeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setInventoryTypes(inventoryTypes.filter((t) => t.id !== typeId));
      }
    } catch (error) {
      console.error('Failed to delete type:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">Inventory</h1>

      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Add Fish Breed</h2>
        <form onSubmit={handleAddInventoryType} className="flex gap-2">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="e.g., Blue Mystery Snails, Nerite Snails..."
            className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 btn-glow bg-blue-900  text-white font-semibold rounded-md"
          >
            Add Type
          </button>
        </form>
      </div>

      {inventoryTypes.length === 0 ? (
        <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-4">No fish breeds added yet. Add your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventoryTypes.map((type) => {
            const item = inventory.find((inv) => inv.item_type === type.name);
            return (
              <div key={type.id} className="bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-100">{type.name}</h3>
                  <button
                    onClick={() => handleDeleteType(type.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>

                {item ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold uppercase">Stock</div>
                        <div className="text-3xl font-bold text-gray-100 mt-2">{item.quantity}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold uppercase">Reserved</div>
                        <div className="text-3xl font-bold text-gray-100 mt-2">{item.reserved_quantity || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-xs font-semibold uppercase">Available</div>
                        <div className="text-3xl font-bold text-green-400 mt-2">
                          {item.quantity - (item.reserved_quantity || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleAdjustQuantity(type.name, 1)}
                        className="flex-1 py-2 btn-glow bg-blue-900  text-white font-semibold rounded-md"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleAdjustQuantity(type.name, -1)}
                        className="flex-1 py-2 btn-glow bg-blue-900  text-white font-semibold rounded-md"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => {
                          setSelectedType(type.name);
                          handleViewHistory(type.name);
                        }}
                        className="flex-1 py-2 btn-glow bg-blue-900  text-white font-semibold rounded-md text-sm"
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
      )}

      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Manual Inventory Update</h2>
        <form onSubmit={handleSetInventory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="itemType" className="block text-sm font-medium text-gray-300">
                Fish Breed
              </label>
              <select
                id="itemType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">Select breed</option>
                {inventoryTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                className="mt-1 w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-300">
                Reason (Optional)
              </label>
              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Recount, new shipment, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 btn-glow bg-blue-900  text-white font-semibold rounded-md disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Set Inventory'}
          </button>
        </form>
      </div>

      {adjustmentHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-4">Adjustment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Reason</th>
                </tr>
              </thead>
              <tbody>
                {adjustmentHistory.map((adj) => (
                  <tr key={adj.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {new Date(adj.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-100">
                      <span className="px-2 py-1 btn-glow bg-blue-900 text-blue-200 rounded text-xs font-semibold">
                        {adj.adjustment_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold">
                      <span className={adj.quantity_change > 0 ? 'text-green-400' : 'text-red-400'}>
                        {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{adj.reason}</td>
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
