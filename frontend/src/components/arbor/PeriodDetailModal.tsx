'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Sparkles, 
  User, 
  Trash2,
  Building,
  School
} from 'lucide-react';

export function PeriodDetailModal() {
  const {
    activePeriodDetails,
    setActivePeriodDetails,
    days,
    studyRooms,
    allLessons,
    deleteFreeRoom,
    currentUser,
    claimStudyRoom,
    clearClaimedRoom,
    setIsAddFreeRoomModalOpen,
  } = useArborMatrix();

  if (!activePeriodDetails) return null;

  const { period, day } = activePeriodDetails;
  const dayName = days.find(d => d.id === day)?.name || 'Monday';

  // Free Study rooms in this period
  const periodStudyRooms = studyRooms.filter(
    r => r.dayOfWeek === day && r.periodId === period.id
  );

  // All classes in this period
  const periodClasses = allLessons.filter(
    l => l.dayOfWeek === day && l.periodId === period.id
  );

  const isClaimedHere = 
    currentUser?.currentClaimedRoom?.periodId === period.id && 
    currentUser?.currentClaimedRoom?.dayOfWeek === day;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {dayName} • {period.name}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {period.startTime} – {period.endTime}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Classes and free study rooms scheduled during this period
            </p>
          </div>

          <button
            onClick={() => setActivePeriodDetails(null)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1">
          {/* Section 1: Free Study Rooms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Available Study Rooms ({periodStudyRooms.length})</span>
              </h3>

              <button
                onClick={() => {
                  setActivePeriodDetails(null);
                  setIsAddFreeRoomModalOpen(true);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Room
              </button>
            </div>

            <div className="space-y-2">
              {periodStudyRooms.map(room => {
                const isSelectedByMe = currentUser?.currentClaimedRoom?.roomCode === room.roomCode && isClaimedHere;

                return (
                  <div
                    key={room.id}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                      isSelectedByMe
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40'
                        : 'border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-white font-extrabold text-base shadow-2xs">
                        {room.roomCode}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            Room {room.roomCode}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded dark:bg-emerald-950 dark:text-emerald-300">
                            FREE STUDY ROOM
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {room.lessonSubject} {room.supervisor ? `• ${room.supervisor}` : ''}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Source: {room.contributedBy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelectedByMe ? (
                        <button
                          onClick={clearClaimedRoom}
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                        >
                          You are here
                        </button>
                      ) : (
                        <button
                          onClick={() => claimStudyRoom(room.roomCode, period.id, day)}
                          className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-800 dark:text-emerald-300 shadow-2xs active:scale-95"
                        >
                          Study Here
                        </button>
                      )}

                      {room.isManual && (
                        <button
                          onClick={() => deleteFreeRoom(room.id)}
                          title="Remove reported room"
                          className="p-1.5 text-zinc-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {periodStudyRooms.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
                  No designated free study rooms logged for this period yet.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: All Timetabled Classes in this Period */}
          <div>
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              All Classes in {period.name} ({periodClasses.length})
            </h3>

            <div className="space-y-2">
              {periodClasses.map(lesson => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                    lesson.isStudy
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`font-mono font-bold text-xs px-2 py-1 rounded-md ${
                      lesson.isStudy 
                        ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' 
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {lesson.roomCode}
                    </div>

                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {lesson.subject}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {lesson.teacher || 'Teacher'} • {lesson.startTime} – {lesson.endTime}
                      </div>
                    </div>
                  </div>

                  {lesson.isStudy && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      Free Study Slot
                    </span>
                  )}
                </div>
              ))}

              {periodClasses.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400">
                  No individual subject lessons synchronized yet for this slot.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setActivePeriodDetails(null)}
            className="rounded-xl px-4 py-2 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
