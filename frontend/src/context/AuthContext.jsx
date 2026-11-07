import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('studyshare_token')));

  useEffect(() => {
    if (!localStorage.getItem('studyshare_token')) return;
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('studyshare_token'))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('studyshare_token', data.token);
      setUser(data.user);
      return data.user;
    },
    async register(values) {
      const { data } = await api.post('/auth/register', values);
      localStorage.setItem('studyshare_token', data.token);
      setUser(data.user);
      return data.user;
    },
    logout() {
      localStorage.removeItem('studyshare_token');
      setUser(null);
    },
    setUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
