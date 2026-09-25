'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Calendar,
  Plus,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export function ArborNavbar() {
  const {
    days,
    selectedDay,
    setSelectedDay,
    selectedWeek,
    setSelectedWeek,
    liveCurrentWeek,
    studentSession,
    logoutStudent,
    setIsAddFreeRoomModalOpen,
  } = useArborMatrix();

  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs backdrop-blur-md">
      {/* 1. Main Header */}
      <div className="bg-[#7fb743] text-white px-3 py-2 sm:px-6 sm:py-3 transition-colors">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
          {/* Brand — FreeRooms */}
          <div className="flex items-center shrink-0">
            <span className="font-black text-lg sm:text-xl tracking-tight leading-none text-white select-none">
              FreeRooms
            </span>
          </div>

          {/* Center: Week A / Week B Switcher with Live Week Indicator */}
          <div className="flex items-center rounded-xl bg-black/15 p-1 border border-white/20 text-xs sm:text-sm font-bold shadow-2xs">
            <button
              onClick={() => setSelectedWeek('A')}
              className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-1.5 transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 ${
                selectedWeek === 'A'
                  ? 'bg-white text-[#7fb743] shadow-xs'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Week A</span>
              {liveCurrentWeek === 'A' && (
                <span className="h-2 w-2 rounded-full bg-[#7fb743] sm:bg-[#7fb743]" title="Current Academic Week" />
              )}
            </button>
            <button
              onClick={() => setSelectedWeek('B')}
              className={`rounded-lg px-3 py-1.5 sm:px-4 sm:py-1.5 transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 ${
                selectedWeek === 'B'
                  ? 'bg-white text-[#7fb743] shadow-xs'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Week B</span>
              {liveCurrentWeek === 'B' && (
                <span className="h-2 w-2 rounded-full bg-[#7fb743] sm:bg-[#7fb743]" title="Current Academic Week" />
              )}
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Toggler */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all shadow-2xs cursor-pointer active:scale-95 touch-manipulation shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-200" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </button>

            {/* Report Free Room */}
            <button
              onClick={() => setIsAddFreeRoomModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white border border-white/30 transition-all shadow-2xs cursor-pointer active:scale-95 touch-manipulation shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Room</span>
            </button>

            {/* Anonymous Sign Out */}
            {studentSession && (
              <button
                onClick={logoutStudent}
                title="Sign out of session"
                className="flex items-center justify-center h-9 w-9 sm:h-auto sm:w-auto gap-1 text-white/90 hover:text-white sm:px-3 sm:py-2 rounded-xl hover:bg-black/15 text-xs sm:text-sm font-bold transition-colors cursor-pointer touch-manipulation shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation: Day Tabs (Mobile Scrollable & Tablet Touch Bar) */}
      <div className="bg-white dark:bg-[#1a201c] border-b border-[#dbe1dd] dark:border-[#28332c] px-2 sm:px-6 transition-colors">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none touch-scroll w-full sm:w-auto">
            {days.map(d => {
              const isSelected = selectedDay === d.id;
              const isToday = new Date().getDay() === d.id;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation shrink-0 ${
                    isSelected
                      ? 'bg-[#7fb743] text-white shadow-2xs'
                      : 'text-[#4d5954] dark:text-[#a0b0a6] hover:bg-[#f2f5f3] dark:hover:bg-[#222c25] hover:text-[#1b2129] dark:hover:text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{d.name}</span>
                  {isToday && (
                    <span className={`text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded-md font-mono font-black ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-[#edf6e4] dark:bg-[#233120] text-[#7fb743]'
                    }`}>
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-[#596560] dark:text-[#8b9c92] shrink-0 ml-2">
            <span>View:</span>
            <span className="font-extrabold text-[#7fb743]">
              Week {selectedWeek} {selectedWeek === liveCurrentWeek ? '(Current)' : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
