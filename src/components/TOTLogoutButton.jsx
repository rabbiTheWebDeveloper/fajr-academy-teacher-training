'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

export default function TOTLogoutButton({
  variant = 'header',
  className = '',
  showText = true,
}) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    const confirmLogout = window.confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?');
    if (!confirmLogout) return;

    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/login';
    }
  };

  if (variant === 'header') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        title="লগআউট করুন"
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
          loading
            ? 'bg-rose-950/40 text-rose-300 cursor-not-allowed border border-rose-800/40'
            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 hover:border-rose-500/50 shadow-sm'
        } ${className}`}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
        )}
        {showText && <span>{loading ? 'লগআউট হচ্ছে...' : 'লগআউট'}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
        loading
          ? 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
          : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-100 border border-rose-500/40 shadow-sm'
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 text-rose-400" />
      )}
      <span>{loading ? 'লগআউট হচ্ছে...' : 'লগআউট করুন'}</span>
    </button>
  );
}
