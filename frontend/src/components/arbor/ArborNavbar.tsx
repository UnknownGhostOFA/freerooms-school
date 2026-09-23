'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  Calendar, 
  Plus, 
  User, 
  LogOut, 
  CheckCircle2, 
  School
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
  } = useArborMatrix();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sticky top-0 z-40 shadow-2xs">
      {/* Top Banner / School info */}
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white font-bold text-sm shadow-xs">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                Wrenn School
              </span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
                FreeRooms
              </span>
            </div>
          </div>
        </div>

        {/* Center: Week A / Week B Toggle */}
        <div className="flex items-center rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
          <button
            onClick={() => setSelectedWeek('A')}
            className={`rounded-md px-3 py-1 transition-all ${
              selectedWeek === 'A'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Week A
          </button>
          <button
            onClick={() => setSelectedWeek('B')}
            className={`rounded-md px-3 py-1 transition-all ${
              selectedWeek === 'B'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Week B
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Add Manual Room Button */}
          <button
            onClick={() => setIsAddFreeRoomModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Add Free Room</span>
          </button>

          {/* User Profile / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline font-semibold">{currentUser.name}</span>
              </div>
              <button
                onClick={logoutUser}
                title="Log out"
                className="text-zinc-400 hover:text-rose-600 p-1"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Arbor Day Switcher Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none">
          {days.map(d => {
            const isSelected = selectedDay === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{d.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
