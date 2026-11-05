'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Light / dark theme shared by the admin and instructor panels.
 * One saved choice (localStorage "fajr_admin_theme", the key the admin panel always used)
 * applies to both. Default is light.
 *
 * Besides the `theme-light` / `theme-dark` class on the panel root, the choice is mirrored on
 * <html data-panel-theme>: shadcn's mobile sidebar sheet, tooltips and menus render in a portal
 * outside the panel root and read their colors from there. The attribute is removed when the
 * panel unmounts, so the public site is never affected.
 */
const PanelThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  isLight: true,
});

export function PanelThemeProvider({ children }) {
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

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.panelTheme = theme;
    return () => {
      delete root.dataset.panelTheme;
    };
  }, [theme]);

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
    <PanelThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLight, mounted }}>
      {children}
    </PanelThemeContext.Provider>
  );
}

export function usePanelTheme() {
  const context = useContext(PanelThemeContext);
  if (!context) {
    throw new Error('usePanelTheme must be used within a PanelThemeProvider');
  }
  return context;
}
