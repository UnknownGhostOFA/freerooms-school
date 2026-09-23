'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  Link as LinkIcon, 
  X, 
  Globe, 
  User, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  School
} from 'lucide-react';

export function LinkArborModal() {
  const { isLinkArborModalOpen, setIsLinkArborModalOpen, linkArborAndContribute } = useArborMatrix();

  const [schoolUrl, setSchoolUrl] = useState('https://wrenn-school.uk.arbor.sc');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success?: boolean; text: string } | null>(null);

  if (!isLinkArborModalOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);

    const res = await linkArborAndContribute(schoolUrl.trim(), email.trim(), password);

    if (res.success) {
      setStatusMsg({ success: true, text: res.message });
      setTimeout(() => {
        setIsLinkArborModalOpen(false);
        setStatusMsg(null);
      }, 1500);
    } else {
      setStatusMsg({ success: false, text: res.message });
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Sync Arbor Timetable
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pulls your study rooms (free rooms) into the matrix
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLinkArborModalOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSync} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              School URL
            </label>
            <input
              type="text"
              readOnly
              value={schoolUrl}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              School Arbor Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. wsc-20dhpa@wrennschool.org.uk"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Arbor Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your Arbor password"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {statusMsg && (
            <div className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
              statusMsg.success 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
            }`}>
              {statusMsg.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400">
              Extracts 6th form study rooms
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkArborModalOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 shadow-2xs active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>Fetch & Add Study Rooms</span>
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
