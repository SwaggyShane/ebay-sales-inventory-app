import { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function EbaySyncPage() {
  const [authToken, setAuthToken] = useState('');
  const [syncHistory, setSyncHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [configuring, setConfiguring] = useState(false);

  const { token } = useStore();

  useEffect(() => {
    fetchSyncHistory();
  }, [token]);

  const fetchSyncHistory = async () => {
    try {
      const response = await fetch('/api/ebay/sync/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSyncHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch sync history:', error);
    }
  };

  const handleConfigureCredentials = async (e) => {
    e.preventDefault();
    if (!authToken.trim()) {
      setMessage('Please enter an auth token');
      setMessageType('error');
      return;
    }

    setConfiguring(true);
    try {
      const response = await fetch('/api/ebay/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ authToken }),
      });

      if (response.ok) {
        setMessage('eBay credentials configured successfully!');
        setMessageType('success');
        setAuthToken('');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to configure credentials');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setConfiguring(false);
    }
  };

  const handleStartSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/ebay/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Sync started successfully!');
        setMessageType('success');
        await fetchSyncHistory();
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to start sync');
        setMessageType('error');
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-100">eBay Sync</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Configure eBay API</h2>
            <p className="text-gray-400 text-sm mb-4">
              Enter your eBay API authentication token to enable automatic syncing of sales and inventory.
            </p>
            <form onSubmit={handleConfigureCredentials} className="space-y-4">
              <div>
                <label htmlFor="authToken" className="block text-sm font-medium text-gray-300 mb-2">
                  eBay Auth Token
                </label>
                <textarea
                  id="authToken"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 outline-none font-mono text-sm"
                  placeholder="Paste your eBay API auth token here..."
                  rows="6"
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    messageType === 'success'
                      ? 'bg-green-100 text-green-200'
                      : 'bg-red-100 text-red-200'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={configuring}
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition disabled:opacity-50"
              >
                {configuring ? 'Configuring...' : 'Configure Credentials'}
              </button>
            </form>
          </div>

          <div className="bg-gray-800 border border-blue-500/30 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-400 mb-2">Setup Instructions</h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Log in to your eBay Developer account</li>
              <li>Generate a new OAuth token from the API documentation</li>
              <li>Copy the auth token and paste it above</li>
              <li>Click "Configure Credentials"</li>
              <li>Use the "Start Sync" button to fetch your latest sales</li>
            </ol>
          </div>
        </div>

        <div>
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Start Sync</h2>
            <p className="text-gray-400 text-sm mb-6">
              Trigger an immediate sync with eBay to fetch your latest sales data and update inventory.
            </p>

            <button
              onClick={handleStartSync}
              disabled={syncing}
              className="w-full py-3 bg-green-900/300 hover:bg-green-600 text-white font-bold rounded-md transition disabled:opacity-50 text-lg"
            >
              {syncing ? 'Syncing...' : 'Start Sync Now'}
            </button>

            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <h3 className="font-semibold text-gray-100 mb-2">How Sync Works</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>✓ Fetches all recent sales from your eBay account</li>
                <li>✓ Automatically creates new customer records</li>
                <li>✓ Updates customer lifetime spent and purchase count</li>
                <li>✓ Automatically adjusts inventory levels</li>
                <li>✓ Records sync status and logs any errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-100">Sync History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Items Synced</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Error</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                    No sync history yet
                  </td>
                </tr>
              ) : (
                syncHistory.map((sync) => (
                  <tr key={sync.id} className="border-b hover:bg-gray-700">
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {new Date(sync.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-100">
                      <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs font-semibold">
                        {sync.sync_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          sync.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : sync.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {sync.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{sync.items_synced}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">
                      {sync.error_message || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
