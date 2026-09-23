'use client';

import React, { useState } from 'react';
import { Room } from '@/types';
import { useRooms } from '@/context/RoomContext';
import { 
  Sliders, 
  X, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw,
  Clock
} from 'lucide-react';

interface ManualOverrideModalProps {
  room: Room | null;
  onClose: () => void;
}

export function ManualOverrideModal({ room, onClose }: ManualOverrideModalProps) {
  const { setRoomOverride, clearRoomOverride, roomStatuses } = useRooms();
  const [notes, setNotes] = useState('');

  if (!room) return null;

  const currentStatus = roomStatuses.find(s => s.room.id === room.id);
  const activeOverride = currentStatus?.activeOverride;

  const handleApplyOverride = (type: 'force_free' | 'force_occupied' | 'assigned_to_me') => {
    setRoomOverride(room.id, type, notes.trim() || undefined);
    onClose();
  };

  const handleClear = () => {
    clearRoomOverride(room.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Manual Override: {room.code}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Instantly adjust availability state for {room.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {activeOverride && (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Active Override: </span>
                <span>{activeOverride.type} until {activeOverride.endTime}</span>
              </div>
              <button
                onClick={handleClear}
                className="text-xs font-semibold underline hover:text-amber-950"
              >
                Reset
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Override Reason / Note (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Class cancelled / Teacher absent / Group study"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="pt-2 space-y-2">
            {/* 1. Force Mark Free */}
            <button
              onClick={() => handleApplyOverride('force_free')}
              className="w-full flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-left hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Force Mark as Free
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                    Use when a lesson is cancelled or the room is empty
                  </div>
                </div>
              </div>
            </button>

            {/* 2. Self Assign */}
            <button
              onClick={() => handleApplyOverride('assigned_to_me')}
              className="w-full flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-left hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Claim as My Study Room
                  </div>
                  <div className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
                    Designate this room as your current active study base
                  </div>
                </div>
              </div>
            </button>

            {/* 3. Force Mark Occupied */}
            <button
              onClick={() => handleApplyOverride('force_occupied')}
              className="w-full flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-left hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Force Mark as Occupied
                  </div>
                  <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                    Use if an unlisted meeting or group is using the room
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
