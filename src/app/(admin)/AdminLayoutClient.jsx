'use client';

import React from 'react';
import { useAdminTheme } from './AdminThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function AdminLayoutClient({ adminUser, sidebar, children }) {
  const { theme, toggleTheme, isLight } = useAdminTheme();

  return (
    <div
      className={`admin-theme-root min-h-screen flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-slate-950 ${
        isLight ? 'theme-light' : 'theme-dark'
      }`}
    >
      {/* Interactive Sidebar */}
      {sidebar}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              ⚡ LIVE ADMIN SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300 shadow-xs'
              }`}
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>লাইট মোড</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>ডার্ক মোড</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex flex-col text-right">
              <span className={`font-bold text-xs sm:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {adminUser.fullName}
              </span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500 font-semibold' : 'text-slate-400'}`}>
                {adminUser.email}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
              {adminUser.fullName ? adminUser.fullName[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t py-4 px-6 text-center text-xs">
          © 2026 Fajr Academy — TOT Enterprise Management System v2.0
        </footer>
      </main>
    </div>
  );
}
