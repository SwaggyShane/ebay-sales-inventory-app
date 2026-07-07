import { useState, useEffect } from 'react';
import { useStore } from '../store';

export default function CustomerDetail({ customerId, onBack }) {
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [loading, setLoading] = useState(true);

  const { token } = useStore();

  useEffect(() => {
    Promise.all([
      fetchCustomer(),
      fetchSales(),
      fetchNotes(),
    ]).finally(() => setLoading(false));
  }, [customerId, token]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`/api/customers/${customerId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote, note_type: noteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes([data, ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!customer) {
    return <div className="text-center py-8 text-red-600">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-blue-500 hover:text-blue-700 font-medium mb-4"
      >
        ← Back to Customers
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-xs font-semibold uppercase">Lifetime Spent</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">
            ${parseFloat(customer.lifetime_spent || 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-xs font-semibold uppercase">Purchases</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{customer.purchase_count}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-xs font-semibold uppercase">Avg Ticket</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">
            ${parseFloat(customer.average_ticket || 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-xs font-semibold uppercase">Status</div>
          <div className="text-xl font-bold text-green-600 mt-1">
            {customer.is_return_customer ? 'Repeat Customer' : 'New Customer'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-800">Sales History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No sales found
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-800">{sale.item_title}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{sale.quantity}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-gray-800">
                          ${parseFloat(sale.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-800">Add Note</h2>
            </div>
            <form onSubmit={handleAddNote} className="p-6 space-y-4">
              <div>
                <label htmlFor="noteType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="noteType"
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="general">General</option>
                  <option value="promise">Promise</option>
                  <option value="issue">Issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  id="newNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Add a note..."
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition text-sm"
              >
                Add Note
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow mt-6">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-800">Notes</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {notes.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">No notes</div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-4 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800">{note.note_type}</span>
                      {note.is_resolved && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{note.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
