'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { forgetPushOnThisDevice } from '@/components/push/usePushNotifications';

/**
 * Logs out with a POST to /api/auth/logout (never a prefetchable GET link), then
 * navigates to /login. If the request fails the user stays signed in and is told so.
 */
export default function TOTLogoutButton({
  variant = 'header',
  className = '',
  showText = true,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    if (loading) return;
    const confirmLogout = window.confirm('আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?');
    if (!confirmLogout) return;

    setLoading(true);
    setError('');
    try {
      await forgetPushOnThisDevice(); // stop this account's notifications on this device
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.replace('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      const message = 'লগআউট করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
      setLoading(false);
      setError(message);
      // The compact header button has no room for an inline message.
      if (variant === 'header') window.alert(message);
    }
  };

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        title={error || 'লগআউট করুন'}
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
    <div className="w-full space-y-1.5">
      <button
        type="button"
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
      {error && <p className="text-[11px] text-rose-300 text-center">{error}</p>}
    </div>
  );
}
