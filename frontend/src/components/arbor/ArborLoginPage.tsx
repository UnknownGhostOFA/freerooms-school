'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  School, 
  Lock, 
  Mail, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export function ArborLoginPage() {
  const { arborLogin } = useArborMatrix();

  const [email, setEmail] = useState('wsc-20dhpa@wrennschool.org.uk');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const result = await arborLogin('https://wrenn-school.uk.arbor.sc', email.trim(), password);
    if (!result.success) {
      setErrorMessage(result.message || 'The username or password you entered is incorrect. Please try again.');
    }
    setIsLoading(false);
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setEmail('wsc-20dhpa@wrennschool.org.uk');
    setPassword('papanmom1986');
    const result = await arborLogin('https://wrenn-school.uk.arbor.sc', 'wsc-20dhpa@wrennschool.org.uk', 'papanmom1986');
    if (!result.success) {
      setErrorMessage(result.message || 'Login failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f5] flex flex-col justify-center items-center px-4 py-12">
      {/* Centered Arbor Box */}
      <div className="w-full max-w-md bg-white rounded-xl border border-[#dbe1dd] p-8 shadow-sm">
        {/* Header Branding */}
        <div className="text-center pb-6 border-b border-[#eaeeec]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#005047] text-white font-black text-2xl shadow-xs">
            <span>A</span>
          </div>

          <h1 className="mt-4 text-xl font-bold text-[#1b2129] tracking-tight">
            Wrenn School
          </h1>
          <p className="text-xs font-semibold text-[#00875f] mt-0.5">
            Arbor FreeRooms • 6th Form Study Matrix
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1b2129] mb-1">
              Email / Username
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. wsc-20dhpa@wrennschool.org.uk"
                className="w-full rounded border border-[#dbe1dd] bg-white px-3.5 py-2.5 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none placeholder:text-[#78827e]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#1b2129]">
                Arbor Password
              </label>
              <span className="text-[11px] text-[#00875f] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your school password"
              className="w-full rounded border border-[#dbe1dd] bg-white px-3.5 py-2.5 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none placeholder:text-[#78827e]"
            />
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="rounded p-3 bg-[#fdebec] border border-[#f14668] text-xs text-[#9f2f2d] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded bg-[#005047] py-2.5 text-xs font-bold text-white hover:bg-[#003d36] disabled:opacity-50 shadow-2xs active:scale-98 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Signing in to Arbor & Syncing...</span>
              </>
            ) : (
              <>
                <span>Log in to FreeRooms</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Quick Demo Sign In Button for instant testing */}
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 rounded border border-[#dbe1dd] bg-[#f9fbf9] py-2 text-xs font-semibold text-[#005047] hover:bg-[#e3f5ec] transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-[#00875f]" />
            <span>Fast Sign In as Dhyan P. (Year 13)</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#eaeeec] flex items-center justify-between text-[11px] text-[#78827e]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00875f]" />
            Direct TLS connection to Arbor
          </span>
          <span>Wrenn School MIS</span>
        </div>
      </div>
    </div>
  );
}
