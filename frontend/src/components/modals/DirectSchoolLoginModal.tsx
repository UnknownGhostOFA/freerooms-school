'use client';

import React, { useState } from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  Lock, 
  X, 
  Globe, 
  User, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  Zap,
  School
} from 'lucide-react';

interface DirectSchoolLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DirectSchoolLoginModal({ isOpen, onClose }: DirectSchoolLoginModalProps) {
  const { importBookings } = useRooms();

  const [schoolUrl, setSchoolUrl] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('freerooms_direct_school_url')) || 'https://wrenn-school.uk.arbor.sc';
  });
  const [username, setUsername] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('freerooms_direct_username')) || '';
  });
  const [password, setPassword] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ success?: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolUrl.trim() || !username.trim() || !password.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/auth/arbor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolUrl: schoolUrl.trim(),
          username: username.trim(),
          password: password,
          autoRenew,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your school URL, username, and password.');
      }

      // Save school URL and username for easy future sessions
      localStorage.setItem('freerooms_direct_school_url', schoolUrl.trim());
      localStorage.setItem('freerooms_direct_username', username.trim());
      localStorage.setItem('freerooms_server_session_active', 'true');

      if (data.rooms && data.rooms.length > 0) {
        importBookings(data.bookings || [], data.rooms || []);
      }

      setStatusMessage({
        success: true,
        text: `Logged in to ${schoolUrl}! Server is now automatically maintaining your session and syncing live room availability.`,
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setStatusMessage({
        success: false,
        text: err.message || 'Login error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                School Sign-In (Auto-Sync)
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Server acquires & maintains session ID automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
          {/* School URL */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              School Arbor Subdomain / URL *
            </label>
            <input
              type="text"
              required
              value={schoolUrl}
              onChange={e => setSchoolUrl(e.target.value)}
              placeholder="e.g. yourschool.uk.arbor.sc"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Username / Email */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-emerald-600" />
              School Email / Username *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. student@school.org.uk"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your school Arbor password"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Auto-renew checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={autoRenew}
                onChange={e => setAutoRenew(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">
                Auto-renew session in background (keeps data live 24/7)
              </span>
            </label>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
              statusMessage.success 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
            }`}>
              {statusMessage.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct HTTPS TLS connection</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Sign In & Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
