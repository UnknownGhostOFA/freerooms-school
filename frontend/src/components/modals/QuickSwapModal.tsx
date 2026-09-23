'use client';

import React, { useState } from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  ArrowRightLeft, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Clock,
  Building,
  Check
} from 'lucide-react';
import { formatDuration } from '@/lib/timetableEngine';

interface QuickSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSwapModal({ isOpen, onClose }: QuickSwapModalProps) {
  const { 
    rooms, 
    userAssignment, 
    roomStatuses, 
    recommendedFreeRooms, 
    quickSwapRoom,
    setUserAssignment,
    simulatedTime 
  } = useRooms();

  const [assignedRoomId, setAssignedRoomId] = useState(userAssignment?.assignedRoomId || 'room-6b');
  const [selectedFreeRoomId, setSelectedFreeRoomId] = useState(
    userAssignment?.actualRoomId || recommendedFreeRooms[0]?.room.id || 'room-6d'
  );
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('Assigned room was occupied / noisy');

  if (!isOpen) return null;

  const currentAssignedRoom = rooms.find(r => r.id === assignedRoomId);
  const availableRooms = roomStatuses.filter(s => {
    if (!s.isAvailable) return false;
    if (s.room.id === assignedRoomId) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.room.name.toLowerCase().includes(q) || s.room.code.toLowerCase().includes(q) || s.room.block.toLowerCase().includes(q);
    }
    return true;
  });

  const handleConfirmSwap = () => {
    if (!selectedFreeRoomId) return;

    setUserAssignment({
      assignedRoomId: assignedRoomId,
      actualRoomId: selectedFreeRoomId,
      reason: reason
    });

    quickSwapRoom(selectedFreeRoomId, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Quick Room Relocator & Swap
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                e.g. Assigned to 6B, but finding and taking 6D because it is free
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

        <div className="mt-4 space-y-4 overflow-y-auto pr-1">
          {/* Step 1: Assigned Room Selection */}
          <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
              1. What room were you officially assigned / scheduled in?
            </label>
            <select
              value={assignedRoomId}
              onChange={e => setAssignedRoomId(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.name} ({r.block})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Choose Free Alternative */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                2. Select which free room you want to move into (at {simulatedTime}):
              </label>
              <span className="text-[11px] text-zinc-400">
                {availableRooms.length} available
              </span>
            </div>

            {/* Quick search */}
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search available free rooms..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            {/* List of Free Rooms */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {availableRooms.map(statusData => {
                const isSelected = selectedFreeRoomId === statusData.room.id;

                return (
                  <div
                    key={statusData.room.id}
                    onClick={() => setSelectedFreeRoomId(statusData.room.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-600'
                        : 'border-zinc-200 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                        isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}>
                        {statusData.room.code}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            {statusData.room.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            • {statusData.room.floor}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Free until {statusData.freeUntil || 'End of day'} ({formatDuration(statusData.freeDurationMinutes)} remaining)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 hidden sm:inline">
                        {statusData.room.block}
                      </span>
                      {isSelected ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-zinc-300 dark:border-zinc-700" />
                      )}
                    </div>
                  </div>
                );
              })}

              {availableRooms.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-xs text-zinc-500">
                  No free rooms match your search filter.
                </div>
              )}
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Relocation Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Assigned room had a class / need quiet study space"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmSwap}
            disabled={!selectedFreeRoomId}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Confirm Move to {rooms.find(r => r.id === selectedFreeRoomId)?.code || 'Selected Room'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
