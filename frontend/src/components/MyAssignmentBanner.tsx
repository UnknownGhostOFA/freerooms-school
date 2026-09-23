'use client';

import React from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRightLeft,
  X,
  Clock
} from 'lucide-react';
import { formatDuration } from '@/lib/timetableEngine';

interface MyAssignmentBannerProps {
  onOpenQuickSwap: () => void;
}

export function MyAssignmentBanner({ onOpenQuickSwap }: MyAssignmentBannerProps) {
  const { 
    userAssignment, 
    rooms, 
    roomStatuses, 
    recommendedFreeRooms, 
    quickSwapRoom,
    clearUserAssignment 
  } = useRooms();

  if (!userAssignment) return null;

  const assignedRoom = rooms.find(r => r.id === userAssignment.assignedRoomId);
  const actualRoom = rooms.find(r => r.id === userAssignment.actualRoomId);
  const assignedStatus = roomStatuses.find(s => s.room.id === userAssignment.assignedRoomId);

  // Best alternative free room (e.g. 6D)
  const bestAlternative = recommendedFreeRooms.find(r => r.room.id !== userAssignment.assignedRoomId);

  const hasSwapped = !!userAssignment.actualRoomId;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-emerald-50/80 p-4 shadow-sm dark:border-indigo-950/60 dark:from-indigo-950/40 dark:via-zinc-900/60 dark:to-emerald-950/30">
      {/* Decorative ambient blur */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left side: Current status */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${
            hasSwapped 
              ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
              : assignedStatus?.isAvailable 
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-amber-600 text-white shadow-amber-500/20'
          }`}>
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                My Room Status
              </span>

              {hasSwapped ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> Relocated to {actualRoom?.code || 'Free Room'}
                </span>
              ) : assignedStatus?.isAvailable ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200">
                  Assigned Room Free
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                  <AlertCircle className="h-3 w-3" /> Assigned {assignedRoom?.code} is Occupied
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <div className="text-zinc-700 dark:text-zinc-300">
                Timetable Assigned:{' '}
                <span className="font-bold text-zinc-900 dark:text-white">
                  {assignedRoom?.name || 'Room 6B'}
                </span>
                {assignedStatus?.currentBooking && (
                  <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                    ({assignedStatus.currentBooking.subject} until {assignedStatus.currentBooking.endTime})
                  </span>
                )}
              </div>

              {hasSwapped && actualRoom && (
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Now Studying in {actualRoom.name} ({actualRoom.code})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Smart Recommendation or Switch action */}
        <div className="flex flex-wrap items-center gap-2">
          {!hasSwapped && bestAlternative && (
            <div className="flex items-center gap-2 rounded-xl bg-white/80 p-1.5 pl-3 pr-2 shadow-xs dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800">
              <div className="text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Free alternative:
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {bestAlternative.room.name} ({formatDuration(bestAlternative.freeDurationMinutes)} free)
                </span>
              </div>

              <button
                onClick={() => quickSwapRoom(bestAlternative.room.id, `Swapped to ${bestAlternative.room.code} (Free)`)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <span>Move to {bestAlternative.room.code}</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenQuickSwap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>{hasSwapped ? 'Change Room' : 'Choose Free Room'}</span>
          </button>

          {hasSwapped && (
            <button
              onClick={() => {
                quickSwapRoom(userAssignment.assignedRoomId, 'Reset back to assigned room');
              }}
              title="Reset back to assigned room"
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              Reset
            </button>
          )}

          <button
            onClick={clearUserAssignment}
            title="Dismiss"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
