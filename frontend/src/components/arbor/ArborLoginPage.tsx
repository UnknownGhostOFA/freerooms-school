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
    <div className="min-h-screen bg-[#f4f6f5] dark:bg-[#121614] flex flex-col justify-center items-center px-4 py-6 sm:py-12 transition-colors">
      {/* Centered Arbor Box */}
      <div className="w-full max-w-md bg-white dark:bg-[#1a201c] rounded-3xl sm:rounded-2xl border border-[#dbe1dd] dark:border-[#28332c] p-5 sm:p-8 shadow-sm">
        {/* Header Branding */}
        <div className="text-center pb-3 sm:pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7fb743] text-white font-black text-2xl shadow-xs">
            <span>A</span>
          </div>

          <h1 className="mt-3.5 text-xl sm:text-2xl font-black text-[#1b2129] dark:text-[#f0f4f1] tracking-tight">
            Wrenn School
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#7fb743] mt-0.5">
            Arbor FreeRooms • 2-Week Study Matrix
          </p>
        </div>

        {/* Separator: Log in using Arbor */}
        <div className="flex items-center gap-3 my-3 sm:my-4">
          <div className="h-px flex-1 bg-[#eaeeec] dark:bg-[#28332c]" />
          <span className="text-[11px] text-[#596560] dark:text-[#8b9c92] font-black uppercase tracking-wider">
            Sign In with Arbor
          </span>
          <div className="h-px flex-1 bg-[#eaeeec] dark:bg-[#28332c]" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#1b2129] dark:text-[#f0f4f1] mb-1.5">
              School Email / Parent Email / Username
            </label>
            <input
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. wsc-20dhpa@wrennschool.org.uk or parent email"
              className="w-full rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#151b17] px-4 py-3 text-sm text-[#1b2129] dark:text-[#f0f4f1] focus:border-[#7fb743] focus:outline-none placeholder:text-[#78827e] dark:placeholder:text-[#607066]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                Arbor Password
              </label>
              <a
                href="https://wrenn-school.uk.arbor.sc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7fb743] font-bold hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              autoCapitalize="none"
              autoCorrect="off"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your Arbor password"
              className="w-full rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#151b17] px-4 py-3 text-sm text-[#1b2129] dark:text-[#f0f4f1] focus:border-[#7fb743] focus:outline-none placeholder:text-[#78827e] dark:placeholder:text-[#607066]"
            />
          </div>

          {/* 2-Week Sync & API Authorization Notice */}
          <div className="rounded-2xl bg-[#f7faf8] dark:bg-[#151b17] border border-[#dbe1dd] dark:border-[#28332c] p-3.5 space-y-2 text-xs text-[#4d5954] dark:text-[#a0b0a6]">
            <div className="flex items-center gap-1.5 font-black text-[#7fb743]">
              <CalendarCheck className="h-4 w-4 shrink-0" />
              <span>Automatic 2-Week Sync (Week A & Week B)</span>
            </div>
            <p className="leading-relaxed">
              Signing in automatically retrieves your 2-week study timetable and updates the cloud database with free study spaces. Passwords are never saved.
            </p>

            <label className="flex items-start gap-2 pt-2 border-t border-[#eaeeec] dark:border-[#28332c] cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded border-[#dbe1dd] dark:border-[#28332c] text-[#7fb743] focus:ring-[#7fb743]"
              />
              <span className="text-[11px] text-[#596560] dark:text-[#8b9c92] leading-tight">
                I authorize timetable sync and agree to the{' '}
                <Link href="/terms" className="text-[#7fb743] font-bold underline" target="_blank">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#7fb743] font-bold underline" target="_blank">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="rounded-xl p-3.5 bg-[#fdebec] dark:bg-[#321614] border border-[#f14668] dark:border-[#5c221e] text-xs font-semibold text-[#9f2f2d] dark:text-[#ff7875] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#7fb743] hover:bg-[#689934] px-4 py-3.5 text-sm font-black text-white shadow-2xs cursor-pointer transition-all active:scale-[0.99] touch-manipulation disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Signing in to Arbor & Syncing...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Sign In with Arbor</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badges */}
        <div className="mt-5 pt-4 border-t border-[#eaeeec] dark:border-[#28332c] flex items-center justify-center gap-2 text-[11px] text-[#596560] dark:text-[#8b9c92]">
          <ShieldCheck className="h-4 w-4 text-[#7fb743]" />
          <span>Encrypted Direct MIS Connection • Zero Stored Credentials</span>
        </div>
      </div>
    </div>
  );
}
