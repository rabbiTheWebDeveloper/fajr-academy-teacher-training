'use client';

import React from 'react';
import { useAdminTheme } from './AdminThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function AdminLayoutClient({ adminUser, sidebar, children }) {
  const { theme, toggleTheme, isLight } = useAdminTheme();

  return (
    <div
      className={`admin-theme-root min-h-screen flex flex-col md:flex-row font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-150 ${
        isLight ? 'theme-light bg-[#F4F6F9] text-slate-900' : 'theme-dark bg-[#070A11] text-slate-100'
      }`}
    >
      {/* Interactive Sidebar */}
      {sidebar}

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 flex flex-col min-h-screen transition-colors duration-150 ${
          isLight ? 'bg-[#F4F6F9]' : 'bg-[#070A11]'
        }`}
      >
        {/* Top Header */}
        <header
          className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 border-b transition-colors ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-2xs'
              : 'bg-[#0B1120]/95 backdrop-blur-md border-slate-800/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-black px-3 py-1 rounded-full border tracking-wide transition-colors ${
                isLight
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border cursor-pointer ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs'
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
              <span className={`font-black text-xs sm:text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {adminUser.fullName}
              </span>
              <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {adminUser.email}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
              {adminUser.fullName ? adminUser.fullName[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>

        {/* Footer */}
        <footer
          className={`border-t py-4 px-6 text-center text-xs font-medium transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-900 text-slate-500'
          }`}
        >
          © 2026 Fajr Academy — TOT Enterprise Management System v2.0
        </footer>
      </main>
    </div>
  );
}
