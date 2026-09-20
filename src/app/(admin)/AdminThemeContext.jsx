'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  isLight: true,
});

export function AdminThemeProvider({ children }) {
  // Default is explicitly 'light' as requested
  const [theme, setThemeState] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedTheme = localStorage.getItem('fajr_admin_theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeState(savedTheme);
        } else {
          localStorage.setItem('fajr_admin_theme', 'light');
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(validTheme);
    try {
      localStorage.setItem('fajr_admin_theme', validTheme);
    } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isLight = theme === 'light';

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLight, mounted }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
