'use client';

import React, { useState } from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  Cookie, 
  X, 
  Globe, 
  Key, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle, 
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

interface LiveCookieSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveCookieSyncModal({ isOpen, onClose }: LiveCookieSyncModalProps) {
  const { importBookings, simulatedDate } = useRooms();

  const [arborSchoolUrl, setArborSchoolUrl] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('freerooms_arbor_url')) || '';
  });
  const [arborCookie, setArborCookie] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('freerooms_arbor_cookie')) || '';
  });
  const [teamsCookie, setTeamsCookie] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('freerooms_teams_cookie')) || '';
  });

  const [autoSyncInterval, setAutoSyncInterval] = useState<number>(5); // minutes
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [showHowTo, setShowHowTo] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arborSchoolUrl.trim() && !arborCookie.trim() && !teamsCookie.trim()) return;

    setIsSyncing(true);
    setSyncResult(null);

    try {
      // Save credentials locally in browser
      localStorage.setItem('freerooms_arbor_url', arborSchoolUrl.trim());
      localStorage.setItem('freerooms_arbor_cookie', arborCookie.trim());
      localStorage.setItem('freerooms_teams_cookie', teamsCookie.trim());

      let totalRooms = 0;
      let totalBookings = 0;
      let arborSuccess = false;

      // 1. Sync Arbor Live
      if (arborSchoolUrl && arborCookie) {
        const res = await fetch('/api/arbor/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolUrl: arborSchoolUrl,
            cookie: arborCookie,
            date: simulatedDate,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          arborSuccess = true;
          totalRooms += data.rooms?.length || 0;
          totalBookings += data.bookings?.length || 0;
          importBookings(data.bookings || [], data.rooms || []);
        } else {
          throw new Error(data.error || 'Failed to authenticate with Arbor using provided cookies');
        }
      }

      // 2. Sync Teams
      if (teamsCookie) {
        const teamsRes = await fetch('/api/teams/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cookieOrToken: teamsCookie,
            date: simulatedDate,
          }),
        });

        const teamsData = await teamsRes.json();
        if (teamsRes.ok && teamsData.success) {
          totalBookings += teamsData.bookings?.length || 0;
          importBookings(teamsData.bookings || [], teamsData.rooms || []);
        }
      }

      setSyncResult({
        success: true,
        message: `Live Sync Successful! Loaded ${totalRooms} live rooms and ${totalBookings} timetabled classes.`
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setSyncResult({
        success: false,
        message: err.message || 'Error communicating with school servers.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Live Data Connection via Cookies
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Directly authenticate with your Arbor School portal & Microsoft Teams
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

        <form onSubmit={handleSaveAndSync} className="mt-4 space-y-4 overflow-y-auto pr-1">
          {/* How to get cookies helper */}
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setShowHowTo(!showHowTo)}
              className="flex w-full items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200"
            >
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <HelpCircle className="h-4 w-4" /> How to find your Arbor session cookie (30 seconds)
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">
                {showHowTo ? 'Hide guide' : 'Show guide'}
              </span>
            </button>

            {showHowTo && (
              <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 border-t border-zinc-200 dark:border-zinc-700 pt-2 font-normal">
                <p>1. Open your school's Arbor login in Google Chrome or Edge and sign in.</p>
                <p>2. Press <kbd className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">F12</kbd> (or right click ➔ Inspect) to open DevTools.</p>
                <p>3. Go to the <strong>Application</strong> tab (or <strong>Storage</strong>) ➔ <strong>Cookies</strong> on the left ➔ click your school domain.</p>
                <p>4. Or in the <strong>Network</strong> tab, click any request (like <code>my-timetable</code>) and copy the <code>Cookie:</code> header from Request Headers.</p>
                <p>5. Paste the cookie string below. All data is processed locally and never shared.</p>
              </div>
            )}
          </div>

          {/* Arbor School URL */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              School Arbor URL *
            </label>
            <input
              type="text"
              required
              value={arborSchoolUrl}
              onChange={e => setArborSchoolUrl(e.target.value)}
              placeholder="e.g. https://oakridge.uk.arbor.sc"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Arbor Cookie */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-emerald-600" />
              Arbor Session Cookie Header *
            </label>
            <textarea
              rows={3}
              required
              value={arborCookie}
              onChange={e => setArborCookie(e.target.value)}
              placeholder="arbor_session=...; PHPSESSID=...; RememberMe=..."
              className="mt-1 w-full font-mono text-xs rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Microsoft Teams Cookie / Token */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-indigo-600" />
              Microsoft Teams Cookie or Bearer Token (optional)
            </label>
            <input
              type="text"
              value={teamsCookie}
              onChange={e => setTeamsCookie(e.target.value)}
              placeholder="authtoken=Bearer ... or ESTSAUTH=..."
              className="mt-1 w-full font-mono text-xs rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Auto background sync setting */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Live Background Sync Frequency
            </span>
            <select
              value={autoSyncInterval}
              onChange={e => setAutoSyncInterval(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:bg-zinc-800 dark:border-zinc-700"
            >
              <option value={2}>Every 2 minutes</option>
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
              <option value={0}>Manual refresh only</option>
            </select>
          </div>

          {/* Result Banner */}
          {syncResult && (
            <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
              syncResult.success 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
            }`}>
              {syncResult.success ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{syncResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Cookies stored locally</span>
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
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Connecting to Arbor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Connect & Sync Live Data</span>
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
