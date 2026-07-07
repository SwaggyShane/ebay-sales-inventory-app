import { useEffect } from 'react';
import { useStore } from './store';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const { token, user, setUser, setToken } = useStore();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    }
  }, [setToken]);

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  return <main className="min-h-screen bg-gray-50">
    {token && user ? <Dashboard /> : <Login />}
  </main>;
}
