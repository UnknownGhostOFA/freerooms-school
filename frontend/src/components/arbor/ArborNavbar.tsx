'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  Calendar, 
  Plus, 
  User, 
  LogOut, 
  School,
  Link as LinkIcon,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export function ArborNavbar() {
  const {
    days,
    selectedDay,
    setSelectedDay,
    selectedWeek,
    setSelectedWeek,
    currentUser,
    logoutUser,
    setIsLoginModalOpen,
    setIsAddFreeRoomModalOpen,
    setIsLinkArborModalOpen,
  } = useArborMatrix();

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* 1. Main Arbor Green MIS Header */}
      <div className="bg-[#005047] text-white px-4 py-2.5 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#005047] font-black text-lg shadow-sm">
              <span className="leading-none">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-tight text-white">
                  Wrenn School
                </span>
                <span className="text-[11px] font-semibold bg-[#0d685d] text-emerald-100 px-2 py-0.5 rounded border border-emerald-500/30">
                  Arbor FreeRooms
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-none mt-0.5">
                6th Form Study Matrix & Free Classrooms
              </p>
            </div>
          </div>

          {/* Center: Week A / Week B Switcher */}
          <div className="flex items-center rounded-md bg-[#003d36] p-1 border border-emerald-700/40 text-xs font-bold">
            <button
              onClick={() => setSelectedWeek('A')}
              className={`rounded px-3 py-1 transition-all ${
                selectedWeek === 'A'
                  ? 'bg-white text-[#005047] shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Week A
            </button>
            <button
              onClick={() => setSelectedWeek('B')}
              className={`rounded px-3 py-1 transition-all ${
                selectedWeek === 'B'
                  ? 'bg-white text-[#005047] shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              Week B
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            {/* Report Free Room */}
            <button
              onClick={() => setIsAddFreeRoomModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#0d685d] hover:bg-[#137c70] px-2.5 py-1.5 text-xs font-semibold text-white border border-emerald-500/30 transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Free Room</span>
            </button>

            {/* Sync Arbor */}
            <button
              onClick={() => setIsLinkArborModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-[#00875f] hover:bg-[#00704f] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors"
              title="Sync student timetable from Arbor"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Connect Arbor Account</span>
              <span className="md:hidden">Sync Arbor</span>
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-700/60">
                <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                  <div className="h-7 w-7 rounded-full bg-white text-[#005047] flex items-center justify-center font-bold text-xs shadow-2xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline font-semibold">{currentUser.name}</span>
                </div>
                <button
                  onClick={logoutUser}
                  title="Sign out"
                  className="text-emerald-200 hover:text-white p-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-white text-[#005047] px-3 py-1.5 text-xs font-bold hover:bg-emerald-50 shadow-2xs transition-colors"
              >
                <User className="h-3.5 w-3.5 text-[#005047]" />
                <span>App Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation: Day Tabs (Arbor Style) */}
      <div className="bg-white border-b border-[#dbe1dd] px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none">
            {days.map(d => {
              const isSelected = selectedDay === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#005047] text-white shadow-2xs'
                      : 'text-[#4d5954] hover:bg-[#f2f5f3] hover:text-[#1b2129]'
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{d.name}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#596560]">
            <span>Active Cycle:</span>
            <span className="font-bold text-[#005047]">Week {selectedWeek}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
