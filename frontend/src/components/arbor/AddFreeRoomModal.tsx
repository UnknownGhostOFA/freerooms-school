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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-2xs sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#1a201c] p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col transition-all">
        {/* Mobile Swipe Handle Indicator */}
        <div className="sm:hidden h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-3 shrink-0" />

        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#eaeeec] dark:border-[#28332c]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef4e8] dark:bg-[#2d1d0e] text-[#f8a340] shrink-0">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1b2129] dark:text-[#f0f4f1]">
                Report / Add Free Room
              </h2>
              <p className="text-[11px] sm:text-xs text-[#596560] dark:text-[#8b9c92]">
                Add an alphanumeric room (e.g. 6D, 6B, 22)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAddFreeRoomModalOpen(false);
              setError(null);
            }}
            className="rounded-xl p-2 text-[#596560] dark:text-[#8b9c92] hover:bg-[#f2f5f3] dark:hover:bg-[#222c25] hover:text-[#1b2129] dark:hover:text-white cursor-pointer touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff1f0] dark:bg-[#321614] border border-[#ffccc7] dark:border-[#5c221e] p-3 text-xs text-[#cf1322] dark:text-[#ff7875]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-0.5">
          <div>
            <label className="text-xs sm:text-sm font-bold text-[#1b2129] dark:text-[#f0f4f1]">
              Room Alphanumeric Code *
            </label>
            <input
              type="text"
              required
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              value={roomCode}
              onChange={e => {
                setRoomCode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. 6D, 6B, 6F, 6E, 7, 22"
              className="mt-1.5 w-full rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-[#fafbfc] dark:bg-[#151b17] px-4 py-3 text-base font-black uppercase text-[#1b2129] dark:text-[#f0f4f1] focus:border-[#7fb743] focus:bg-white dark:focus:bg-[#1a201c] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                Day
              </label>
              <select
                value={dayOfWeek}
                onChange={e => {
                  setDayOfWeek(Number(e.target.value));
                  if (error) setError(null);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-[#fafbfc] dark:bg-[#151b17] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1b2129] dark:text-[#f0f4f1] focus:border-[#7fb743] focus:bg-white dark:focus:bg-[#1a201c] focus:outline-none"
              >
                {days.map(d => (
                  <option key={d.id} value={d.id} className="dark:bg-[#1a201c]">{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-bold text-[#1b2129] dark:text-[#f0f4f1]">
                Period
              </label>
              <select
                value={periodId}
                onChange={e => {
                  setPeriodId(e.target.value);
                  if (error) setError(null);
                }}
                className="mt-1.5 w-full rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-[#fafbfc] dark:bg-[#151b17] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1b2129] dark:text-[#f0f4f1] focus:border-[#7fb743] focus:bg-white dark:focus:bg-[#1a201c] focus:outline-none"
              >
                {periods.map(p => (
                  <option key={p.id} value={p.id} className="dark:bg-[#1a201c]">{p.name} ({p.startTime})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-bold text-[#1b2129] dark:text-[#f0f4f1]">
              Notes / Location (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Sixth form private study block"
              className="mt-1.5 w-full rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-[#fafbfc] dark:bg-[#151b17] px-3.5 py-2.5 text-xs sm:text-sm text-[#1b2129] dark:text-[#f0f4f1] focus:border-[#7fb743] focus:bg-white dark:focus:bg-[#1a201c] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eaeeec] dark:border-[#28332c]">
            <button
              type="button"
              onClick={() => {
                setIsAddFreeRoomModalOpen(false);
                setError(null);
              }}
              className="rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#222c25] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#596560] dark:text-[#a0b0a6] hover:bg-[#f2f5f3] dark:hover:bg-[#2a372f] cursor-pointer touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#7fb743] px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-[#689934] shadow-2xs cursor-pointer active:scale-95 touch-manipulation"
            >
              Add Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
