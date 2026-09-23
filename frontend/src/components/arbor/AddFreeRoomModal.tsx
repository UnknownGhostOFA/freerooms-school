'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { Plus, X, Sparkles, Building, Calendar, Clock } from 'lucide-react';

export function AddFreeRoomModal() {
  const {
    isAddFreeRoomModalOpen,
    setIsAddFreeRoomModalOpen,
    periods,
    days,
    selectedDay,
    addManualFreeRoom,
  } = useArborMatrix();

  const [roomCode, setRoomCode] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay);
  const [periodId, setPeriodId] = useState(periods[1]?.id || 'p1');
  const [notes, setNotes] = useState('');

  if (!isAddFreeRoomModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    addManualFreeRoom(roomCode.trim(), Number(dayOfWeek), periodId, notes.trim() || undefined);
    setRoomCode('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Report / Add Free Room
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Add a study room or empty classroom to the period matrix
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddFreeRoomModalOpen(false)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Room Code *
            </label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={e => setRoomCode(e.target.value)}
              placeholder="e.g. 6D, 6B, 6F, 7, 22"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold uppercase text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Day
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {days.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Period
              </label>
              <select
                value={periodId}
                onChange={e => setPeriodId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.startTime})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Notes / Group Details (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Empty classroom / Year 13 study group"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddFreeRoomModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 active:scale-95 shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Matrix</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
