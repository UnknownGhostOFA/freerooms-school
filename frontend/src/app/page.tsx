'use client';

import React from 'react';
import { ArborMatrixProvider } from '@/context/ArborMatrixContext';
import { ArborNavbar } from '@/components/arbor/ArborNavbar';
import { ArborPeriodMatrix } from '@/components/arbor/ArborPeriodMatrix';
import { PeriodDetailModal } from '@/components/arbor/PeriodDetailModal';
import { AddFreeRoomModal } from '@/components/arbor/AddFreeRoomModal';
import { LinkArborModal } from '@/components/arbor/LinkArborModal';
import { AppLoginModal } from '@/components/arbor/AppLoginModal';

function MainApp() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      {/* Arbor Clean Navbar */}
      <ArborNavbar />

      {/* Main Single Matrix Dashboard */}
      <main className="flex-1">
        <ArborPeriodMatrix />
      </main>

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-zinc-200 bg-white/70 py-4 dark:border-zinc-800 dark:bg-zinc-900 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Wrenn School FreeRooms • Crowdsourced 6th Form Study Matrix
          </p>
          <div className="text-zinc-400 text-[11px]">
            Periods 1 to 5 • Free Study Rooms Aggregator
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PeriodDetailModal />
      <AddFreeRoomModal />
      <LinkArborModal />
      <AppLoginModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <ArborMatrixProvider>
      <MainApp />
    </ArborMatrixProvider>
  );
}
