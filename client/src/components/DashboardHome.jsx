import { useEffect } from 'react';
import { useStore } from '../store';

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="text-gray-600 text-sm font-medium">{label}</div>
      <div className="text-3xl font-bold text-gray-800 mt-2">{value}</div>
    </div>
  );
}

export default function DashboardHome() {
  const { token, stats, setStats } = useStore();

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sales/stats/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const totalRevenue = stats?.total_revenue ? parseFloat(stats.total_revenue).toFixed(2) : '0.00';
  const avgTicket = stats?.avg_ticket ? parseFloat(stats.avg_ticket).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your eBay Sales & Inventory Manager</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Sales"
          value={stats?.total_sales || 0}
          color="border-blue-500"
        />
        <StatCard
          label="Total Revenue"
          value={`$${totalRevenue}`}
          color="border-green-500"
        />
        <StatCard
          label="Average Ticket"
          value={`$${avgTicket}`}
          color="border-purple-500"
        />
        <StatCard
          label="Unique Customers"
          value={stats?.unique_customers || 0}
          color="border-orange-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Getting Started</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="text-blue-500 font-bold">1.</span>
            <span>Go to Customers to add your first customer or sync from eBay</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500 font-bold">2.</span>
            <span>Add sales manually or sync from eBay automatically</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500 font-bold">3.</span>
            <span>Set up your inventory for Purple and Magenta Mystery Snails</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500 font-bold">4.</span>
            <span>Configure your eBay API credentials to enable syncing</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-500 font-bold">5.</span>
            <span>Use customer notes to track promises and commitments</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
