'use client';

import React, { useState } from 'react';
import { Room, Booking } from '@/types';
import { useRooms } from '@/context/RoomContext';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  Building, 
  Sparkles, 
  Trash2, 
  Plus, 
  Sliders,
  CheckCircle2,
  XCircle,
  Tag
} from 'lucide-react';
import { formatDuration, timeStringToMinutes } from '@/lib/timetableEngine';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onOpenOverride: (room: Room) => void;
}

export function RoomDetailModal({ room, onClose, onOpenOverride }: RoomDetailModalProps) {
  const { 
    bookings, 
    addBooking, 
    deleteBooking, 
    simulatedDate, 
    currentDayOfWeek, 
    quickSwapRoom,
    deleteRoom,
    userAssignment,
    roomStatuses,
    periods
  } = useRooms();

  const [showAddBooking, setShowAddBooking] = useState(false);
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [startTime, setStartTime] = useState('11:10');
  const [endTime, setEndTime] = useState('12:10');

  if (!room) return null;

  const currentStatus = roomStatuses.find(s => s.room.id === room.id);

  // Filter day's bookings
  const dayBookings = bookings
    .filter(b => {
      if (b.roomId !== room.id) return false;
      if (b.date) return b.date === simulatedDate;
      return b.dayOfWeek === currentDayOfWeek;
    })
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    addBooking({
      roomId: room.id,
      subject: subject.trim(),
      teacher: teacher.trim() || undefined,
      startTime,
      endTime,
      dayOfWeek: currentDayOfWeek,
      date: simulatedDate,
      source: 'manual',
    });

    setSubject('');
    setTeacher('');
    setShowAddBooking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                {room.code}
              </span>
              <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {room.floor}
              </span>
              {currentStatus?.isAvailable ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  🟢 Free Now
                </span>
              ) : (
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  🔴 In Use
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {room.name} • {room.block} • Capacity: {room.capacity} seats
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenOverride(room)}
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Override</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1">
          {/* Features */}
          <div>
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Room Equipment & Features
            </span>
            <div className="flex flex-wrap gap-1.5">
              {room.features.map((feat, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Schedule for Today */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Full Day Timetable Schedule ({simulatedDate})
              </span>
              <button
                onClick={() => setShowAddBooking(!showAddBooking)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Book Slot
              </button>
            </div>

            {/* Add booking inline form */}
            {showAddBooking && (
              <form onSubmit={handleCreateBooking} className="mb-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Book / Reserve Room Slot
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Subject (e.g. Maths Revision)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="text"
                    placeholder="Staff / Student Name"
                    value={teacher}
                    onChange={e => setTeacher(e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900 dark:border-zinc-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900 dark:border-zinc-700"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900 dark:border-zinc-700"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddBooking(false)}
                    className="px-2.5 py-1 text-xs text-zinc-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Save Booking
                  </button>
                </div>
              </form>
            )}

            {/* List of bookings */}
            <div className="space-y-2">
              {dayBookings.map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center font-mono font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                      <span>{b.startTime}</span>
                      <span className="text-[10px] text-zinc-400">{b.endTime}</span>
                    </div>

                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {b.subject}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {b.teacher || b.classGroup || 'Timetabled'} • Source: <span className="uppercase">{b.source}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteBooking(b.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600"
                    title="Remove booking"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {dayBookings.length === 0 && (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900">
                  🎉 No scheduled classes today! This room is completely free.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {room.isCustom ? (
            <button
              onClick={() => {
                if (confirm(`Delete custom room ${room.code}?`)) {
                  deleteRoom(room.id);
                  onClose();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Room
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStatus?.isAvailable && (
              <button
                onClick={() => {
                  quickSwapRoom(room.id, `Relocated to ${room.code}`);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <Sparkles className="h-4 w-4" />
                <span>Move My Study Here</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
