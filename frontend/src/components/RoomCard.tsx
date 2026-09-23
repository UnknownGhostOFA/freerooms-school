'use client';

import React, { useState } from 'react';
import { RoomStatus } from '@/types';
import { useRooms } from '@/context/RoomContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  MapPin, 
  Sparkles, 
  ArrowRightLeft,
  Calendar,
  MoreVertical,
  Sliders,
  Check,
  Building,
  Monitor,
  Flame,
  VolumeX,
  Zap,
  Info
} from 'lucide-react';
import { formatDuration } from '@/lib/timetableEngine';

interface RoomCardProps {
  statusData: RoomStatus;
  onSelectRoom: (room: RoomStatus['room']) => void;
  onOpenOverride: (room: RoomStatus['room']) => void;
}

export function RoomCard({ statusData, onSelectRoom, onOpenOverride }: RoomCardProps) {
  const { room, status, isAvailable, currentBooking, nextBooking, freeUntil, freeDurationMinutes, timeUntilFreeMinutes, isAssignedToUser, activeOverride } = statusData;
  const { quickSwapRoom, setRoomOverride, clearRoomOverride } = useRooms();
  const [showMenu, setShowMenu] = useState(false);

  // Status visual styles
  const getStatusBadge = () => {
    if (activeOverride?.type === 'assigned_to_me' || isAssignedToUser) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          MY STUDY ROOM
        </span>
      );
    }

    if (activeOverride?.type === 'force_free') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          FREE (OVERRIDE)
        </span>
      );
    }

    if (status === 'available') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          FREE NOW {freeDurationMinutes ? `(${formatDuration(freeDurationMinutes)})` : ''}
        </span>
      );
    }

    if (status === 'free_soon') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Clock className="h-3 w-3" />
          FREE IN {timeUntilFreeMinutes} MINS
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        OCCUPIED
      </span>
    );
  };

  const getCardBorder = () => {
    if (isAssignedToUser) {
      return 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20 bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/20 dark:to-zinc-900';
    }
    if (isAvailable) {
      return 'border-zinc-200 hover:border-emerald-400 dark:border-zinc-800 dark:hover:border-emerald-600 bg-white dark:bg-zinc-900';
    }
    return 'border-zinc-200 opacity-90 hover:opacity-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50';
  };

  return (
    <div className={`group relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md ${getCardBorder()}`}>
      {/* Top row: Room Code, Block, Status */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {room.code}
              </span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {room.floor}
              </span>
              {room.isCustom && (
                <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Custom
                </span>
              )}
            </div>
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px]">
              {room.name} • {room.block}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {getStatusBadge()}
          </div>
        </div>

        {/* Current State Details */}
        <div className="mt-3 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
          {isAvailable ? (
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Room is Available
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Until {freeUntil || 'End of Day'}
                </span>
              </div>

              {nextBooking ? (
                <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                  Next: <span className="font-medium text-zinc-800 dark:text-zinc-200">{nextBooking.subject}</span> at {nextBooking.startTime}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                  No subsequent classes scheduled today
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> In Session
                </span>
                <span className="text-zinc-500 dark:text-zinc-400">
                  Free at {currentBooking?.endTime}
                </span>
              </div>

              {currentBooking && (
                <div className="mt-1 text-xs">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {currentBooking.subject}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    {currentBooking.teacher || currentBooking.classGroup || 'Timetabled Class'}
                    {currentBooking.source === 'teams' && ' • (Teams Meeting)'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features & Capacity Tags */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <Users className="h-3 w-3" /> {room.capacity} seats
          </span>

          {room.features.slice(0, 3).map((feat, i) => (
            <span
              key={i}
              className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400"
            >
              {feat}
            </span>
          ))}

          {room.features.length > 3 && (
            <span className="text-[10px] text-zinc-400">
              +{room.features.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectRoom(room)}
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Full Timetable</span>
        </button>

        <div className="flex items-center gap-1.5">
          {/* Quick Swap / Relocate Button */}
          {isAvailable && !isAssignedToUser && (
            <button
              onClick={() => quickSwapRoom(room.id, `Relocated to ${room.code}`)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
              title={`Switch study spot to ${room.code}`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Use Room</span>
            </button>
          )}

          {/* Override button */}
          <button
            onClick={() => onOpenOverride(room)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Manual override availability"
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
