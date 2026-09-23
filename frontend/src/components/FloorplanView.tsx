'use client';

import React from 'react';
import { Room, RoomStatus } from '@/types';
import { useRooms } from '@/context/RoomContext';
import { 
  Building, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  Users
} from 'lucide-react';
import { DEFAULT_BLOCKS } from '@/lib/schoolData';
import { formatDuration } from '@/lib/timetableEngine';

interface FloorplanViewProps {
  onSelectRoom: (room: Room) => void;
  onOpenOverride: (room: Room) => void;
}

export function FloorplanView({ onSelectRoom, onOpenOverride }: FloorplanViewProps) {
  const { 
    roomStatuses, 
    selectedBlock, 
    setSelectedBlock, 
    quickSwapRoom,
    userAssignment 
  } = useRooms();

  const blocksToDisplay = selectedBlock === 'All' 
    ? DEFAULT_BLOCKS 
    : DEFAULT_BLOCKS.filter(b => b === selectedBlock);

  return (
    <div className="space-y-6">
      {blocksToDisplay.map(blockName => {
        const blockRooms = roomStatuses.filter(s => s.room.block === blockName);
        if (blockRooms.length === 0) return null;

        // Group by floor
        const floors = Array.from(new Set(blockRooms.map(s => s.room.floor))).sort();

        return (
          <div 
            key={blockName}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Block Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {blockName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {blockRooms.filter(r => r.isAvailable).length} of {blockRooms.length} rooms free right now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                  {blockRooms.filter(r => r.isAvailable).length} Available
                </span>
              </div>
            </div>

            {/* Floors */}
            <div className="mt-4 space-y-4">
              {floors.map(floorName => {
                const floorRooms = blockRooms.filter(s => s.room.floor === floorName);

                return (
                  <div key={floorName} className="rounded-xl bg-zinc-50/70 p-3 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {floorName}
                      </span>
                      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700/60" />
                    </div>

                    {/* Spatial Room Nodes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {floorRooms.map(statusData => {
                        const { room, isAvailable, status, freeDurationMinutes, currentBooking, isAssignedToUser } = statusData;

                        return (
                          <div
                            key={room.id}
                            className={`relative rounded-xl border p-3.5 transition-all duration-150 flex flex-col justify-between ${
                              isAssignedToUser
                                ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40'
                                : isAvailable
                                ? 'border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-sm dark:border-emerald-950 dark:bg-zinc-900'
                                : 'border-zinc-200 bg-zinc-100/60 opacity-80 hover:opacity-100 dark:border-zinc-800 dark:bg-zinc-900/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                  {room.code}
                                </span>
                                {isAvailable ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    FREE ({formatDuration(freeDurationMinutes)})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                    <XCircle className="h-3 w-3 text-rose-600" />
                                    IN USE
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                {room.name}
                              </p>

                              {currentBooking && (
                                <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-300 font-medium truncate">
                                  {currentBooking.subject} ({currentBooking.endTime})
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                              <button
                                onClick={() => onSelectRoom(room)}
                                className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                              >
                                View
                              </button>

                              {isAvailable && !isAssignedToUser && (
                                <button
                                  onClick={() => quickSwapRoom(room.id, `Floor plan swap to ${room.code}`)}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white shadow-xs hover:bg-emerald-700"
                                >
                                  <Sparkles className="h-2.5 w-2.5" />
                                  <span>Move In</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
