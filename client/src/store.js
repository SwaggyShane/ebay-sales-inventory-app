import { create } from 'zustand';

export const useStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  customers: [],
  sales: [],
  inventory: [],
  customerNotes: {},
  syncHistory: [],
  stats: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setUser: (user) => set({ user }),
  setCustomers: (customers) => set({ customers }),
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, customer],
  })),
  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
  })),

  setSales: (sales) => set({ sales }),
  addSale: (sale) => set((state) => ({
    sales: [...state.sales, sale],
  })),
  deleteSale: (id) => set((state) => ({
    sales: state.sales.filter((s) => s.id !== id),
  })),

  setInventory: (inventory) => set({ inventory }),
  updateInventory: (item) => set((state) => ({
    inventory: state.inventory.map((inv) => (
      inv.id === item.id ? item : inv
    )),
  })),

  setCustomerNotes: (customerId, notes) => set((state) => ({
    customerNotes: { ...state.customerNotes, [customerId]: notes },
  })),
  addCustomerNote: (customerId, note) => set((state) => ({
    customerNotes: {
      ...state.customerNotes,
      [customerId]: [...(state.customerNotes[customerId] || []), note],
    },
  })),
  updateCustomerNote: (customerId, noteId, updates) => set((state) => ({
    customerNotes: {
      ...state.customerNotes,
      [customerId]: state.customerNotes[customerId].map((n) =>
        n.id === noteId ? { ...n, ...updates } : n
      ),
    },
  })),

  setSyncHistory: (history) => set({ syncHistory: history }),
  setStats: (stats) => set({ stats }),

  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      user: null,
      customers: [],
      sales: [],
      inventory: [],
      customerNotes: {},
      syncHistory: [],
      stats: null,
    });
  },
}));
