'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { Plus, X, AlertCircle } from 'lucide-react';

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
  const [periodId, setPeriodId] = useState(periods[0]?.id || 'p1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAddFreeRoomModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setError(null);
    const result = addManualFreeRoom(roomCode.trim(), Number(dayOfWeek), periodId, notes.trim() || undefined);

    if (result && !result.success) {
      setError(result.error || 'Failed to add room.');
      return;
    }

    setRoomCode('');
    setNotes('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-[#dbe1dd] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#eaeeec]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e3f5ec] text-[#005047]">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1b2129]">
                Report / Add Free Room
              </h2>
              <p className="text-xs text-[#596560]">
                Add an alphanumeric study room code (e.g. 6D, 6B, 22)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAddFreeRoomModalOpen(false);
              setError(null);
            }}
            className="rounded p-1 text-[#596560] hover:bg-[#f2f5f3] hover:text-[#1b2129]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#fff1f0] border border-[#ffccc7] p-3 text-xs text-[#cf1322]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1b2129]">
              Room Alphanumeric Code *
            </label>
            <input
              type="text"
              required
              value={roomCode}
              onChange={e => {
                setRoomCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 6D, 6B, 6F, 6E, 7, 22"
              className="mt-1 w-full rounded-lg border border-[#dbe1dd] bg-[#fafbfc] px-3 py-2 text-sm font-extrabold uppercase text-[#1b2129] focus:border-[#00875f] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#1b2129]">
                Day
              </label>
              <select
                value={dayOfWeek}
                onChange={e => {
                  setDayOfWeek(Number(e.target.value));
                  if (error) setError(null);
                }}
                className="mt-1 w-full rounded-lg border border-[#dbe1dd] bg-[#fafbfc] px-3 py-2 text-xs font-semibold text-[#1b2129] focus:border-[#00875f] focus:bg-white focus:outline-none"
              >
                {days.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1b2129]">
                Period
              </label>
              <select
                value={periodId}
                onChange={e => {
                  setPeriodId(e.target.value);
                  if (error) setError(null);
                }}
                className="mt-1 w-full rounded-lg border border-[#dbe1dd] bg-[#fafbfc] px-3 py-2 text-xs font-semibold text-[#1b2129] focus:border-[#00875f] focus:bg-white focus:outline-none"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.startTime})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1b2129]">
              Notes / Location (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Sixth form private study block"
              className="mt-1 w-full rounded-lg border border-[#dbe1dd] bg-[#fafbfc] px-3 py-2 text-xs text-[#1b2129] focus:border-[#00875f] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaeeec]">
            <button
              type="button"
              onClick={() => {
                setIsAddFreeRoomModalOpen(false);
                setError(null);
              }}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-[#596560] hover:bg-[#f2f5f3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#005047] px-4 py-2 text-xs font-bold text-white hover:bg-[#003630] active:scale-95 shadow-2xs"
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
