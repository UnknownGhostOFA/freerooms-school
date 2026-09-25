'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import {
  X,
  CheckCircle2,
  Plus,
  Trash2,
  BookOpen
} from 'lucide-react';

export function PeriodDetailModal() {
  const {
    activePeriodDetails,
    setActivePeriodDetails,
    days,
    selectedWeek,
    studyRooms,
    allLessons,
    deleteFreeRoom,
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-2xs sm:p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#1a201c] p-5 sm:p-6 shadow-2xl max-h-[88vh] sm:max-h-[90vh] flex flex-col transition-all">
        {/* Mobile Swipe Handle Indicator */}
        <div className="sm:hidden h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#eaeeec] dark:border-[#28332c]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-[#1b2129] dark:text-[#f0f4f1]">
                {dayName} • {period.name}
              </span>
              <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded bg-[#edf6e4] dark:bg-[#233120] text-[#7fb743] border border-[#7fb743]/30">
                Week {selectedWeek} • {period.startTime} – {period.endTime}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#596560] dark:text-[#8b9c92] mt-0.5">
              Available free study spaces and active timetabled lessons in this block
            </p>
          </div>

          <button
            onClick={() => setActivePeriodDetails(null)}
            className="rounded-lg p-1.5 text-[#596560] dark:text-[#8b9c92] hover:bg-[#f2f5f3] dark:hover:bg-[#222c25] hover:text-[#1b2129] dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1">
          {/* Section 1: Free Study Rooms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#1b2129] dark:text-[#f0f4f1] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#f8a340]" />
                <span>Available Free Study Rooms ({periodStudyRooms.length})</span>
              </h3>

              <button
                onClick={() => {
                  setActivePeriodDetails(null);
                  setIsAddFreeRoomModalOpen(true);
                }}
                className="text-xs font-bold text-[#f8a340] hover:text-[#c87010] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Report Free Room
              </button>
            </div>

            <div className="space-y-2">
              {periodStudyRooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-[#fafbfc] dark:bg-[#151b17] p-3 transition-all hover:border-[#f8a340]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f8a340] text-white font-black text-base shadow-2xs shrink-0">
                      {room.roomCode}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#1b2129] dark:text-[#f0f4f1]">
                          Room {room.roomCode}
                        </span>
                        <span className="text-[10px] font-bold text-[#c87010] dark:text-[#fbc27b] bg-[#fef4e8] dark:bg-[#2d1d0e] px-1.5 py-0.5 rounded border border-[#f8a340]/40">
                          STUDY SPACE
                        </span>
                      </div>
                      <div className="text-[11px] text-[#4d5954] dark:text-[#a0b0a6]">
                        {room.lessonSubject} {room.supervisor ? `• ${room.supervisor}` : ''}
                      </div>
                      {room.notes && (
                        <div className="text-[10px] text-[#78827e] dark:text-[#8b9c92] mt-0.5">
                          Note: {room.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#fef4e8] dark:bg-[#2d1d0e] text-[#c87010] dark:text-[#fbc27b] border border-[#f8a340]/30 px-2.5 py-1 text-xs font-black">
                      {room.roomCode}
                    </span>

                    {room.isManual && (
                      <button
                        onClick={() => deleteFreeRoom(room.id)}
                        title="Remove reported room"
                        className="p-1 text-[#78827e] hover:text-[#de3e35] cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {periodStudyRooms.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#dbe1dd] dark:border-[#28332c] p-5 text-center text-xs text-[#78827e] dark:text-[#8b9c92]">
                  No free study rooms registered in this period.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: All Timetabled Classes in this Period */}
          <div>
            <h3 className="text-xs font-bold text-[#1b2129] dark:text-[#f0f4f1] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#596560] dark:text-[#8b9c92]" />
              <span>All Timetabled Classes in {period.name} ({periodClasses.length})</span>
            </h3>

            <div className="divide-y divide-[#eaeeec] dark:divide-[#28332c] rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#151b17] text-xs max-h-56 overflow-y-auto">
              {periodClasses.map(lesson => (
                <div key={lesson.id} className="p-2.5 flex items-center justify-between hover:bg-[#f9fbf9] dark:hover:bg-[#222c25]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1b2129] dark:text-[#f0f4f1] min-w-10">
                      {lesson.roomCode}
                    </span>
                    <span className="text-[#4d5954] dark:text-[#a0b0a6] truncate max-w-[200px] sm:max-w-[280px]">
                      {lesson.subject}
                    </span>
                  </div>

                  <div className="text-right text-[#78827e] dark:text-[#8b9c92]">
                    <span>{lesson.teacher || 'Teacher'}</span>
                  </div>
                </div>
              ))}

              {periodClasses.length === 0 && (
                <div className="p-4 text-center text-[#78827e] dark:text-[#8b9c92]">
                  No class timetable entries for this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-[#eaeeec] dark:border-[#28332c] flex items-center justify-end">
          <button
            onClick={() => setActivePeriodDetails(null)}
            className="w-full sm:w-auto rounded-xl bg-[#7fb743] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#689934] cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
