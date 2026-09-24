'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import {
  Lock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CalendarCheck
} from 'lucide-react';

export function ArborLoginPage() {
  const { arborLogin } = useArborMatrix();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (!consentGiven) {
      setErrorMessage('Please accept the consent terms to proceed with timetable sync.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await arborLogin('https://wrenn-school.uk.arbor.sc', email.trim(), password);
    if (!result.success) {
      setErrorMessage(result.message || 'The username or password you entered is incorrect. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Centered Arbor Box */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#dbe1dd] p-6 sm:p-8 shadow-sm">
        {/* Header Branding */}
        <div className="text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#005047] text-white font-black text-2xl shadow-xs">
            <span>A</span>
          </div>

          <h1 className="mt-3.5 text-xl font-bold text-[#1b2129] tracking-tight">
            Wrenn School
          </h1>
          <p className="text-xs font-semibold text-[#00875f] mt-0.5">
            Arbor FreeRooms • 2-Week Study Matrix
          </p>
        </div>

        {/* Separator: Log in using Arbor */}
        <div className="flex items-center gap-3 my-3">
          <div className="h-px flex-1 bg-[#eaeeec]" />
          <span className="text-[11px] text-[#596560] font-bold uppercase tracking-wider">
            Sign In with Arbor
          </span>
          <div className="h-px flex-1 bg-[#eaeeec]" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1b2129] mb-1">
              School Email / Username
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. student@wrennschool.org.uk"
              className="w-full rounded-lg border border-[#dbe1dd] bg-white px-3.5 py-2.5 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none placeholder:text-[#78827e]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#1b2129]">
                Arbor Password
              </label>
              <a
                href="https://wrenn-school.uk.arbor.sc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#00875f] hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your Arbor password"
              className="w-full rounded-lg border border-[#dbe1dd] bg-white px-3.5 py-2.5 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none placeholder:text-[#78827e]"
            />
          </div>

          {/* 2-Week Sync & API Authorization Notice */}
          <div className="rounded-xl bg-[#f7faf8] border border-[#dbe1dd] p-3 space-y-2 text-[11px] text-[#4d5954]">
            <div className="flex items-center gap-1.5 font-bold text-[#005047]">
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Automatic 2-Week Sync (Week A & Week B)</span>
            </div>
            <p className="leading-snug">
              Signing in retrieves your full 2-week study timetable. Study rooms are federated anonymously to the shared cloud database. Passwords are never saved.
            </p>

            <label className="flex items-start gap-2 pt-1.5 border-t border-[#eaeeec] cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-[#dbe1dd] text-[#005047] focus:ring-[#00875f]"
              />
              <span className="text-[10px] text-[#596560] leading-tight">
                I authorize timetable sync and agree to the{' '}
                <Link href="/terms" className="text-[#005047] font-bold underline" target="_blank">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#005047] font-bold underline" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="rounded-lg p-3 bg-[#fdebec] border border-[#f14668] text-xs text-[#9f2f2d] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#005047] py-3 text-xs font-bold text-white hover:bg-[#003d36] disabled:opacity-50 shadow-2xs active:scale-98 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Signing in to Arbor & Syncing 2 Weeks...</span>
              </>
            ) : (
              <span>Sign In & Sync 2-Week Timetable</span>
            )}
          </button>
        </form>

        {/* Footer info links */}
        <div className="mt-5 pt-4 border-t border-[#eaeeec] text-center text-[11px] text-[#78827e] space-x-3">
          <Link href="/terms" className="hover:text-[#005047] hover:underline">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#005047] hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
