'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { User, X, Sparkles, Check, School, Shield } from 'lucide-react';

export function AppLoginModal() {
  const { isLoginModalOpen, setIsLoginModalOpen, loginUser } = useArborMatrix();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isLoginModalOpen) return null;

  const handleGoogleSim = () => {
    loginUser('Student User', 'student@wrennschool.org.uk', 'google');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    loginUser(name.trim(), email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@student.uk`, 'guest');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-xl border border-[#dbe1dd] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#eaeeec]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#005047] text-white font-bold text-sm">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1b2129]">
                Sign In to FreeRooms
              </h2>
              <p className="text-xs text-[#596560]">
                Independent student app profile
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="rounded p-1 text-[#596560] hover:bg-[#f2f5f3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSim}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-[#dbe1dd] bg-white p-2.5 text-xs font-bold text-[#1b2129] hover:bg-[#f2f5f3] shadow-2xs transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-[#eaeeec]" />
            <span className="text-[11px] text-[#78827e] font-semibold">or student name</span>
            <div className="h-px flex-1 bg-[#eaeeec]" />
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#1b2129]">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dhyan"
                className="mt-1 w-full rounded border border-[#dbe1dd] bg-white px-3 py-2 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#1b2129]">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. dhyan@example.com"
                className="mt-1 w-full rounded border border-[#dbe1dd] bg-white px-3 py-2 text-xs text-[#1b2129] focus:border-[#00875f] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-[#005047] py-2.5 text-xs font-bold text-white hover:bg-[#003d36] shadow-2xs transition-all"
            >
              <span>Save Student Profile</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
