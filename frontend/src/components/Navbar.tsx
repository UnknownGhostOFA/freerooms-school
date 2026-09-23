'use client';

import React, { useState } from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  Clock, 
  Calendar, 
  Plus, 
  UploadCloud, 
  ArrowRightLeft, 
  RotateCcw, 
  Sparkles, 
  Search, 
  School, 
  Cookie, 
  KeyRound, 
  Play, 
  Pause 
} from 'lucide-react';
import { DEFAULT_PERIODS } from '@/lib/schoolData';

interface NavbarProps {
  onOpenAddRoom: () => void;
  onOpenImport: () => void;
  onOpenQuickSwap: () => void;
  onOpenCookieSync: () => void;
  onOpenDirectLogin: () => void;
}

export function Navbar({ 
  onOpenAddRoom, 
  onOpenImport, 
  onOpenQuickSwap, 
  onOpenCookieSync,
  onOpenDirectLogin 
}: NavbarProps) {
  const {
    simulatedDate,
    simulatedTime,
    isLiveTime,
    activePeriod,
    setSimulatedDate,
    setSimulatedTime,
    setIsLiveTime,
    jumpToPeriod,
    resetToLiveNow,
    resetAllData,
    userAssignment,
    rooms
  } = useRooms();

  const [showTimeControls, setShowTimeControls] = useState(false);

  // Assigned room code helper
  const assignedRoom = rooms.find(r => r.id === userAssignment?.assignedRoomId);
  const actualRoom = rooms.find(r => r.id === userAssignment?.actualRoomId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                FreeRooms
              </span>
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                School & Arbor
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Live timetable & room availability finder
            </p>
          </div>
        </div>

        {/* Center: Live / Period Status & Time controller */}
        <div className="flex items-center gap-2">
          {/* Quick period indicators */}
          <div className="hidden lg:flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {DEFAULT_PERIODS.map(p => {
              const isActive = activePeriod?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => jumpToPeriod(p.id)}
                  title={`${p.name} (${p.startTime} - ${p.endTime})`}
                  className={`rounded-md px-2 py-1 font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : p.isBreak
                      ? 'text-amber-600 hover:bg-zinc-200 dark:text-amber-400 dark:hover:bg-zinc-800'
                      : 'text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {p.shortName}
                </button>
              );
            })}
          </div>

          {/* Time Picker & Live Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowTimeControls(!showTimeControls)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Clock className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span className="font-semibold text-zinc-900 dark:text-white">
                {simulatedTime}
              </span>
              <span className="hidden sm:inline text-zinc-400">|</span>
              <span className="hidden sm:inline text-zinc-500 dark:text-zinc-400">
                {activePeriod ? activePeriod.shortName : 'Out of Hours'}
              </span>
              {isLiveTime ? (
                <span className="ml-1 inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  LIVE
                </span>
              ) : (
                <span className="ml-1 inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  SIM
                </span>
              )}
            </button>

            {/* Time popover */}
            {showTimeControls && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Timetable Time Traveler
                  </span>
                  <button
                    onClick={resetToLiveNow}
                    className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Live Now
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3 w-3" /> Target Date
                    </label>
                    <input
                      type="date"
                      value={simulatedDate}
                      onChange={e => {
                        setSimulatedDate(e.target.value);
                        setIsLiveTime(false);
                      }}
                      className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1">
                      <Clock className="h-3 w-3" /> Time (HH:MM)
                    </label>
                    <input
                      type="time"
                      value={simulatedTime}
                      onChange={e => {
                        setSimulatedTime(e.target.value);
                        setIsLiveTime(false);
                      }}
                      className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
                    <button
                      onClick={() => {
                        setShowTimeControls(false);
                      }}
                      className="w-full rounded-md bg-zinc-900 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Apply Time
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Swap Button */}
          <button
            onClick={onOpenQuickSwap}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-2.5 py-1.5 text-xs font-semibold text-amber-800 shadow-xs hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
            title="Swap assigned room (e.g. 6B -> 6D)"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {actualRoom ? `Moved to ${actualRoom.code}` : assignedRoom ? `Assigned: ${assignedRoom.code}` : 'Room Swap'}
            </span>
          </button>

          {/* Direct School Sign-In (Auto-Renewal) */}
          <button
            onClick={onOpenDirectLogin}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            title="Sign in with school credentials (server manages and auto-renews session)"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>School Login</span>
          </button>

          {/* Live Cookie Sync Button */}
          <button
            onClick={onOpenCookieSync}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300"
            title="Paste existing session cookie"
          >
            <Cookie className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Cookie Sync</span>
          </button>

          {/* Add Room Button */}
          <button
            onClick={onOpenAddRoom}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Add Room</span>
          </button>

          {/* Import Arbor/Teams Button */}
          <button
            onClick={onOpenImport}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span className="hidden md:inline">ICS / CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
