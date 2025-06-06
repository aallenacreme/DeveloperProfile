import { createContext, useContext, useState, useEffect } from 'react';

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};

export const isAuthenticated = () => !!localStorage.getItem('token');

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  // Sync state with localStorage changes (e.g., from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};