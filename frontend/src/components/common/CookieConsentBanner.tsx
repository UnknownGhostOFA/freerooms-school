'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('freerooms_consent_acknowledged_v1');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('freerooms_consent_acknowledged_v1', 'true');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto animate-in slide-in-from-bottom-5 duration-200">
      <div className="rounded-2xl border border-[#dbe1dd] bg-white/95 backdrop-blur-md p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e3f5ec] text-[#005047] mt-0.5">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1b2129]">
              Privacy & Essential Cookies Notice
            </h4>
            <p className="text-[11px] text-[#596560] mt-0.5 leading-snug">
              FreeRooms uses essential cookies and local storage to synchronize 2-week timetable rooms anonymously. No passwords or private records are stored.{' '}
              <Link href="/privacy" className="text-[#005047] font-bold hover:underline">
                Privacy Policy
              </Link>{' '}
              •{' '}
              <Link href="/terms" className="text-[#005047] font-bold hover:underline">
                Terms
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto rounded-xl bg-[#005047] hover:bg-[#003630] text-white px-4 py-2 text-xs font-bold transition-all shadow-2xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
