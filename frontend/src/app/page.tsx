'use client';

import React from 'react';
import Link from 'next/link';
import { ArborMatrixProvider, useArborMatrix } from '@/context/ArborMatrixContext';
import { ArborNavbar } from '@/components/arbor/ArborNavbar';
import { ArborPeriodMatrix } from '@/components/arbor/ArborPeriodMatrix';
import { ArborLoginPage } from '@/components/arbor/ArborLoginPage';
import { PeriodDetailModal } from '@/components/arbor/PeriodDetailModal';
import { AddFreeRoomModal } from '@/components/arbor/AddFreeRoomModal';
import { CookieConsentBanner } from '@/components/common/CookieConsentBanner';
import { CustomFooter } from '@/components/common/CustomFooter';

function MainDashboard() {
  const { studentSession, isHydrated } = useArborMatrix();

  // 1. While reading session from storage on first mount, show clean Arbor loading indicator (Prevents any login flash)
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#f4f6f5] dark:bg-[#121614] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#7fb743] text-white font-black text-xl flex items-center justify-center shadow-xs animate-pulse">
            A
          </div>
          <span className="text-xs font-bold text-[#596560] dark:text-[#8b9c92] tracking-wider uppercase font-mono">
            Loading FreeRooms...
          </span>
        </div>
      </div>
    );
  }

  // 2. If not logged in after hydration, show Arbor School Login
  if (!studentSession) {
    return <ArborLoginPage />;
  }

  // 3. Logged in: Render full Arbor Period Matrix
  return (
    <div className="min-h-screen bg-[#f4f6f5] dark:bg-[#121614] text-[#1b2129] dark:text-[#f0f4f1] flex flex-col font-sans transition-colors">
      {/* Arbor Navbar */}
      <ArborNavbar />

      {/* Main Period Matrix View */}
      <main className="flex-1">
        <ArborPeriodMatrix />
      </main>

      {/* Custom Big Typography & Info Footer */}
      <CustomFooter />

      {/* Modals & Consent */}
      <PeriodDetailModal />
      <AddFreeRoomModal />
      <CookieConsentBanner />
    </div>
  );
}

export default function HomePage() {
  return (
    <ArborMatrixProvider>
      <MainDashboard />
    </ArborMatrixProvider>
  );
}
