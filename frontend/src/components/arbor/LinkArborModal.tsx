'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  Link as LinkIcon, 
  X, 
  School, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap
} from 'lucide-react';

export function LinkArborModal() {
  const { isLinkArborModalOpen, setIsLinkArborModalOpen, linkArborAndContribute } = useArborMatrix();

  const [schoolUrl, setSchoolUrl] = useState('https://wrenn-school.uk.arbor.sc');
  const [email, setEmail] = useState('wsc-20dhpa@wrennschool.org.uk');
  const [password, setPassword] = useState('papanmom1986');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-[#dbe1dd] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#eaeeec]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#005047] text-white font-bold text-sm shadow-2xs">
              A
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1b2129]">
                Connect School Arbor Account
              </h2>
              <p className="text-xs text-[#596560]">
                Syncs your Week A & Week B study rooms into the matrix
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLinkArborModalOpen(false)}
            className="rounded p-1 text-[#596560] hover:bg-[#f2f5f3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSync} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-bold text-[#1b2129]">
              School Arbor Domain
            </label>
            <input
              type="text"
              readOnly
              value={schoolUrl}
              className="mt-1 w-full rounded border border-[#dbe1dd] bg-[#f2f5f3] px-3 py-2 text-xs font-semibold text-[#596560] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1b2129]">
              School Arbor Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. student@wrennschool.org.uk"
              className="mt-1 w-full rounded border border-[#dbe1dd] bg-white px-3 py-2 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1b2129]">
              Arbor Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your Arbor password"
              className="mt-1 w-full rounded border border-[#dbe1dd] bg-white px-3 py-2 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none"
            />
          </div>

          {statusMsg && (
            <div className={`rounded p-3 text-xs flex items-center gap-2 ${
              statusMsg.success 
                ? 'bg-[#e3f5ec] text-[#005047] border border-[#00875f]' 
                : 'bg-[#fdebec] text-[#9f2f2d] border border-[#f14668]'
            }`}>
              {statusMsg.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#eaeeec]">
            <div className="flex items-center gap-1 text-[11px] text-[#596560]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#00875f]" />
              <span>Direct HTTPS TLS sync</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkArborModalOpen(false)}
                className="rounded px-3 py-2 text-xs font-semibold text-[#596560] hover:bg-[#f2f5f3]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded bg-[#005047] px-4 py-2 text-xs font-bold text-white hover:bg-[#003d36] disabled:opacity-50 shadow-2xs active:scale-95 transition-all"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3.5 w-3.5" />
                    <span>Sync My Timetable</span>
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
