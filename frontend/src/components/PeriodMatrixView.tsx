'use client';

import React from 'react';
import { Room, Period, Booking } from '@/types';
import { useRooms } from '@/context/RoomContext';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Info,
  Building,
  Users
} from 'lucide-react';
import { timeStringToMinutes } from '@/lib/timetableEngine';

interface PeriodMatrixViewProps {
  onSelectRoom: (room: Room) => void;
}

export function PeriodMatrixView({ onSelectRoom }: PeriodMatrixViewProps) {
  const { 
    rooms, 
    periods, 
    bookings, 
    simulatedDate, 
    currentDayOfWeek,
    searchQuery,
    selectedBlock,
    userAssignment,
    quickSwapRoom,
    activePeriod
  } = useRooms();

  // Filter rooms
  const filteredRooms = rooms.filter(r => {
    if (selectedBlock !== 'All' && r.block !== selectedBlock) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchBlock = r.block.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchBlock) return false;
    }
    return true;
  });

  // Helper to find booking for a room in a specific period
  const getPeriodBooking = (roomId: string, period: Period): Booking | null => {
    const pStart = timeStringToMinutes(period.startTime);
    const pEnd = timeStringToMinutes(period.endTime);

    return bookings.find(b => {
      if (b.roomId !== roomId) return false;
      if (b.date && b.date !== simulatedDate) return false;
      if (!b.date && b.dayOfWeek !== currentDayOfWeek) return false;

      const bStart = timeStringToMinutes(b.startTime);
      const bEnd = timeStringToMinutes(b.endTime);

      // Overlaps with this period
      return Math.max(pStart, bStart) < Math.min(pEnd, bEnd);
    }) || null;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Period Timetable Matrix
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Green slots indicate free rooms available for study or bookings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> Free
          </span>
          <span className="flex items-center gap-1 text-rose-600 font-medium">
            <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" /> In Session
          </span>
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" /> Break/Lunch
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-800">
            <tr>
              <th className="sticky left-0 bg-zinc-50 dark:bg-zinc-800/90 p-3 font-semibold min-w-[140px] z-10 border-r border-zinc-200 dark:border-zinc-800">
                Room & Block
              </th>
              {periods.map(p => {
                const isCurrent = activePeriod?.id === p.id;
                return (
                  <th
                    key={p.id}
                    className={`p-3 font-semibold min-w-[120px] text-center ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : ''
                    }`}
                  >
                    <div>{p.name}</div>
                    <div className="text-[10px] font-normal text-zinc-400">
                      {p.startTime} - {p.endTime}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredRooms.map(room => {
              const isAssigned = userAssignment?.assignedRoomId === room.id || userAssignment?.actualRoomId === room.id;

              return (
                <tr 
                  key={room.id}
                  className={`hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors ${
                    isAssigned ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Sticky room info column */}
                  <td className="sticky left-0 bg-white dark:bg-zinc-900 p-3 font-medium border-r border-zinc-200 dark:border-zinc-800 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900 dark:text-white">
                            {room.code}
                          </span>
                          {isAssigned && (
                            <span className="rounded-md bg-indigo-100 px-1 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                              My Room
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                          {room.block}
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectRoom(room)}
                        className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        title="View room"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Period Columns */}
                  {periods.map(p => {
                    const booking = getPeriodBooking(room.id, p);
                    const isCurrentPeriod = activePeriod?.id === p.id;

                    if (p.isBreak) {
                      return (
                        <td 
                          key={p.id} 
                          className="p-2 text-center bg-amber-50/30 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400 text-[10px]"
                        >
                          <span className="italic">Break</span>
                        </td>
                      );
                    }

                    if (booking) {
                      return (
                        <td key={p.id} className="p-1.5">
                          <div 
                            className="rounded-lg bg-rose-50 border border-rose-200 p-1.5 text-[11px] dark:bg-rose-950/40 dark:border-rose-900/60"
                            title={`${booking.subject} (${booking.teacher || 'Class'})`}
                          >
                            <div className="font-semibold text-rose-800 dark:text-rose-300 truncate">
                              {booking.subject}
                            </div>
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 truncate">
                              {booking.teacher || booking.classGroup || 'In Session'}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Slot is free!
                    return (
                      <td key={p.id} className="p-1.5 text-center">
                        <div 
                          onClick={() => {
                            if (isCurrentPeriod) {
                              quickSwapRoom(room.id, `Selected free slot in ${p.shortName}`);
                            }
                          }}
                          className="group/cell flex flex-col items-center justify-center rounded-lg bg-emerald-50/80 border border-emerald-200 p-2 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:hover:bg-emerald-950/60 transition-all"
                        >
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Free
                          </span>
                          {isCurrentPeriod && (
                            <span className="text-[9px] text-emerald-600 opacity-0 group-hover/cell:opacity-100 font-medium transition-opacity">
                              Click to Swap
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
