'use client';

import React from 'react';
import { ArborMatrixProvider, useArborMatrix } from '@/context/ArborMatrixContext';
import { ArborNavbar } from '@/components/arbor/ArborNavbar';
import { ArborPeriodMatrix } from '@/components/arbor/ArborPeriodMatrix';
import { ArborLoginPage } from '@/components/arbor/ArborLoginPage';
import { PeriodDetailModal } from '@/components/arbor/PeriodDetailModal';
import { AddFreeRoomModal } from '@/components/arbor/AddFreeRoomModal';

function MainDashboard() {
  const { studentSession } = useArborMatrix();

  // If not logged in with Arbor, show Arbor School Login page
  if (!studentSession) {
    return <ArborLoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f5] text-[#1b2129] flex flex-col font-sans">
      {/* Arbor Navbar */}
      <ArborNavbar />

      {/* Main Period Matrix View */}
      <main className="flex-1">
        <ArborPeriodMatrix />
      </main>

      {/* Clean Arbor Minimalist Footer */}
      <footer className="border-t border-[#dbe1dd] bg-white py-3.5 text-center text-xs text-[#596560]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Wrenn School FreeRooms • Arbor 6th Form Study Timetable Matrix
          </p>
          <div className="text-[#78827e] text-[11px]">
            Connected as <strong className="text-[#005047]">{studentSession.name}</strong>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 mt-2 text-[10px] text-[#8c9692]">
          Independent student utility. Not affiliated with, endorsed by, or officially associated with Wrenn School or Arbor Education / The Key Group.
        </div>
      </footer>

      {/* Modals */}
      <PeriodDetailModal />
      <AddFreeRoomModal />
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
