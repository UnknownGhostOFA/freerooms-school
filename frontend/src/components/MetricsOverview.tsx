'use client';

import React from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  MapPin, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { formatDuration } from '@/lib/timetableEngine';

export function MetricsOverview() {
  const { 
    roomStatuses, 
    freeRoomsCount, 
    occupiedRoomsCount, 
    freeSoonRoomsCount, 
    activePeriod, 
    simulatedTime,
    setStatusFilter,
    statusFilter,
    rooms
  } = useRooms();

  const total = rooms.length;
  const freePercent = total > 0 ? Math.round((freeRoomsCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Free Rooms Right Now */}
      <div 
        onClick={() => setStatusFilter(statusFilter === 'free_now' ? 'all' : 'free_now')}
        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 shadow-xs ${
          statusFilter === 'free_now'
            ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30'
            : 'border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-emerald-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Free Right Now
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {freeRoomsCount}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            / {total} rooms ({freePercent}%)
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <Sparkles className="h-3 w-3" />
          <span>Click to filter available rooms</span>
        </div>
      </div>

      {/* 2. In Use / Occupied */}
      <div 
        onClick={() => setStatusFilter(statusFilter === 'occupied' ? 'all' : 'occupied')}
        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 shadow-xs ${
          statusFilter === 'occupied'
            ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20 dark:bg-rose-950/30'
            : 'border-zinc-200 bg-white hover:border-rose-300 hover:bg-rose-50/30 dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-rose-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Occupied / Lessons
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <XCircle className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            {occupiedRoomsCount}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            classes running
          </span>
        </div>

        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          From Arbor & Teams timetable
        </div>
      </div>

      {/* 3. Free Soon (<15m) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Free In &lt; 15 mins
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {freeSoonRoomsCount}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            finishing current period
          </span>
        </div>

        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Rooms becoming free shortly
        </div>
      </div>

      {/* 4. Active Period / Timetable Status */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Current Schedule
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-2">
          <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {activePeriod ? activePeriod.name : 'Outside Regular Periods'}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {activePeriod ? `${activePeriod.startTime} – ${activePeriod.endTime}` : `Current: ${simulatedTime}`}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <TrendingUp className="h-3 w-3" />
          <span>Active Day Timetable</span>
        </div>
      </div>
    </div>
  );
}
