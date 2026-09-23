'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import {
  Calendar,
  Plus,
  LogOut,
  Clock,
  Sparkles
} from 'lucide-react';

export function ArborNavbar() {
  const {
    days,
    selectedDay,
    setSelectedDay,
    selectedWeek,
    setSelectedWeek,
    liveCurrentWeek,
    currentDateFormatted,
    studentSession,
    logoutStudent,
    setIsAddFreeRoomModalOpen,
  } = useArborMatrix();

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* 1. Main Arbor Green MIS Header */}
      <div className="bg-[#005047] text-white px-4 py-2.5 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
          {/* Brand & Live Date */}
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
              <p className="text-[11px] text-emerald-200/90 leading-none mt-0.5 flex items-center gap-1.5">
                <Clock className="h-3 w-3 inline text-emerald-300" />
                <span>{currentDateFormatted}</span>
              </p>
            </div>
          </div>

          {/* Center: Week A / Week B Switcher with Live Week Indicator */}
          <div className="flex items-center rounded-md bg-[#003d36] p-1 border border-emerald-700/40 text-xs font-bold">
            <button
              onClick={() => setSelectedWeek('A')}
              className={`rounded px-3 py-1 transition-all flex items-center gap-1.5 ${
                selectedWeek === 'A'
                  ? 'bg-white text-[#005047] shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <span>Week A</span>
              {liveCurrentWeek === 'A' && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Current Academic Week" />
              )}
            </button>
            <button
              onClick={() => setSelectedWeek('B')}
              className={`rounded px-3 py-1 transition-all flex items-center gap-1.5 ${
                selectedWeek === 'B'
                  ? 'bg-white text-[#005047] shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <span>Week B</span>
              {liveCurrentWeek === 'B' && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Current Academic Week" />
              )}
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

            {/* Anonymous Sign Out */}
            {studentSession && (
              <button
                onClick={logoutStudent}
                title="Sign out of session"
                className="flex items-center gap-1 text-emerald-200 hover:text-white px-2 py-1 rounded hover:bg-[#003d36] text-xs font-semibold transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sign Out</span>
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
              const isToday = new Date().getDay() === d.id;

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
                  {isToday && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#005047]'
                    }`}>
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#596560]">
            <span>Active View:</span>
            <span className="font-bold text-[#005047]">
              Week {selectedWeek} {selectedWeek === liveCurrentWeek ? '(Current Week)' : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
