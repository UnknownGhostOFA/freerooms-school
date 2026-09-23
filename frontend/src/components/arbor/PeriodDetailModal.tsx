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
  School,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-xl border border-[#dbe1dd] bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eaeeec]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#1b2129]">
                {dayName} • {period.name}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#e3f5ec] text-[#005047] border border-[#00875f]/30">
                Week {selectedWeek} • {period.startTime} – {period.endTime}
              </span>
            </div>
            <p className="text-xs text-[#596560] mt-0.5">
              Available free study rooms and classes running in this block
            </p>
          </div>

          <button
            onClick={() => setActivePeriodDetails(null)}
            className="rounded p-1 text-[#596560] hover:bg-[#f2f5f3] hover:text-[#1b2129]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1">
          {/* Section 1: Free Study Rooms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#1b2129] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#00875f]" />
                <span>Available Study Rooms ({periodStudyRooms.length})</span>
              </h3>

              <button
                onClick={() => {
                  setActivePeriodDetails(null);
                  setIsAddFreeRoomModalOpen(true);
                }}
                className="text-xs font-bold text-[#005047] hover:text-[#00875f] flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Report Free Room
              </button>
            </div>

            <div className="space-y-2">
              {periodStudyRooms.map(room => {
                const isSelectedByMe = currentUser?.currentClaimedRoom?.roomCode === room.roomCode && isClaimedHere;

                return (
                  <div
                    key={room.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                      isSelectedByMe
                        ? 'border-[#00875f] bg-[#e3f5ec] ring-2 ring-[#00875f]/20'
                        : 'border-[#dbe1dd] bg-[#fafbfc] hover:border-[#00875f]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-[#005047] text-white font-black text-base shadow-2xs">
                        {room.roomCode}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#1b2129]">
                            Room {room.roomCode}
                          </span>
                          <span className="text-[10px] font-bold text-[#005047] bg-[#e3f5ec] px-1.5 py-0.5 rounded border border-[#00875f]/40">
                            FREE STUDY ROOM
                          </span>
                        </div>
                        <div className="text-[11px] text-[#4d5954]">
                          {room.lessonSubject} {room.supervisor ? `• ${room.supervisor}` : ''}
                        </div>
                        <div className="text-[10px] text-[#78827e] mt-0.5">
                          Source: {room.contributedBy}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelectedByMe ? (
                        <button
                          onClick={clearClaimedRoom}
                          className="rounded bg-[#005047] px-3 py-1.5 text-xs font-bold text-white shadow-2xs"
                        >
                          You are here
                        </button>
                      ) : (
                        <button
                          onClick={() => claimStudyRoom(room.roomCode, period.id, day)}
                          className="rounded bg-white border border-[#00875f] px-2.5 py-1 text-xs font-bold text-[#005047] hover:bg-[#e3f5ec] shadow-2xs active:scale-95 transition-all"
                        >
                          Study Here
                        </button>
                      )}

                      {room.isManual && (
                        <button
                          onClick={() => deleteFreeRoom(room.id)}
                          title="Remove reported room"
                          className="p-1 text-[#78827e] hover:text-[#de3e35]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {periodStudyRooms.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#dbe1dd] p-5 text-center text-xs text-[#78827e]">
                  No free study rooms registered in this period.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: All Timetabled Classes in this Period */}
          <div>
            <h3 className="text-xs font-bold text-[#1b2129] uppercase tracking-wider mb-2">
              All Classes in {period.name} ({periodClasses.length})
            </h3>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {periodClasses.map(lesson => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between rounded border p-2.5 text-xs ${
                    lesson.isStudy
                      ? 'border-[#00875f]/50 bg-[#e3f5ec]/50 text-[#005047]'
                      : 'border-[#eaeeec] bg-white text-[#1b2129]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      lesson.isStudy 
                        ? 'bg-[#005047] text-white' 
                        : 'bg-[#f2f5f3] text-[#1b2129]'
                    }`}>
                      {lesson.roomCode}
                    </div>

                    <div>
                      <div className="font-bold">
                        {lesson.subject}
                      </div>
                      <div className="text-[11px] text-[#596560]">
                        {lesson.teacher || 'Teacher'} • {lesson.startTime} – {lesson.endTime}
                      </div>
                    </div>
                  </div>

                  {lesson.isStudy && (
                    <span className="text-[10px] font-bold text-[#005047] bg-white border border-[#00875f] px-2 py-0.5 rounded">
                      Free Study Slot
                    </span>
                  )}
                </div>
              ))}

              {periodClasses.length === 0 && (
                <div className="rounded border border-dashed border-[#dbe1dd] p-3 text-center text-xs text-[#78827e]">
                  No classes listed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end pt-3 border-t border-[#eaeeec]">
          <button
            onClick={() => setActivePeriodDetails(null)}
            className="rounded bg-[#005047] px-4 py-2 text-xs font-bold text-white hover:bg-[#003d36]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
