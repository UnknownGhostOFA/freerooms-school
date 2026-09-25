'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Calendar,
  Plus,
  LogOut,
  Clock,
  Sparkles,
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
    currentDateFormatted,
    studentSession,
    logoutStudent,
    setIsAddFreeRoomModalOpen,
  } = useArborMatrix();

  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full shadow-xs">
      {/* 1. Main Header */}
      <div className="bg-[#7fb743] text-white px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
          {/* Brand — FreeRooms (No Logo) */}
          <div className="flex items-center shrink-0">
            <span className="font-extrabold text-lg sm:text-[21px] tracking-tight leading-none text-white">
              FreeRooms
            </span>
          </div>

          {/* Center: Week A / Week B Switcher with Live Week Indicator */}
          <div className="flex items-center rounded-lg bg-black/15 p-0.5 sm:p-1 border border-white/20 text-xs sm:text-[16px] font-bold">
            <button
              onClick={() => setSelectedWeek('A')}
              className={`rounded-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                selectedWeek === 'A'
                  ? 'bg-white text-[#7fb743] shadow-xs'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Week A</span>
              {liveCurrentWeek === 'A' && (
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#7fb743] sm:bg-white" title="Current Academic Week" />
              )}
            </button>
            <button
              onClick={() => setSelectedWeek('B')}
              className={`rounded-md px-2.5 py-1 sm:px-3.5 sm:py-1.5 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                selectedWeek === 'B'
                  ? 'bg-white text-[#7fb743] shadow-xs'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <span>Week B</span>
              {liveCurrentWeek === 'B' && (
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#7fb743] sm:bg-white" title="Current Academic Week" />
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
              className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
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
              className="flex items-center gap-1 sm:gap-2 rounded-lg bg-white/20 hover:bg-white/30 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-[16px] font-bold text-white border border-white/30 transition-colors shadow-2xs cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Add Free Room</span>
            </button>

            {/* Anonymous Sign Out */}
            {studentSession && (
              <button
                onClick={logoutStudent}
                title="Sign out of session"
                className="flex items-center justify-center h-8 w-8 sm:h-auto sm:w-auto gap-1 text-white/90 hover:text-white sm:px-3 sm:py-1.5 rounded-lg hover:bg-black/15 text-xs sm:text-[16px] font-bold transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation: Day Tabs */}
      <div className="bg-white dark:bg-[#1a201c] border-b border-[#dbe1dd] dark:border-[#28332c] px-3 sm:px-6 transition-colors">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-1.5 sm:py-2 scrollbar-none w-full sm:w-auto">
            {days.map(d => {
              const isSelected = selectedDay === d.id;
              const isToday = new Date().getDay() === d.id;

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-[17px] font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#7fb743] text-white shadow-2xs'
                      : 'text-[#4d5954] dark:text-[#a0b0a6] hover:bg-[#f2f5f3] dark:hover:bg-[#222c25] hover:text-[#1b2129] dark:hover:text-white'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{d.name}</span>
                  {isToday && (
                    <span className={`text-[9px] sm:text-[12px] px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded font-mono font-extrabold ${
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

          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-[16px] text-[#596560] dark:text-[#8b9c92] shrink-0 ml-2">
            <span>Active View:</span>
            <span className="font-extrabold text-[#7fb743]">
              Week {selectedWeek} {selectedWeek === liveCurrentWeek ? '(Current Week)' : ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
