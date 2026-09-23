'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Calendar,
  Sparkles,
  School
} from 'lucide-react';

export function ArborPeriodMatrix() {
  const {
    periods,
    days,
    selectedDay,
    setSelectedDay,
    selectedWeek,
    studyRooms,
    allLessons,
    setActivePeriodDetails,
    setIsAddFreeRoomModalOpen,
    currentUser,
  } = useArborMatrix();

  const currentDayName = days.find(d => d.id === selectedDay)?.name || 'Today';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Title Header Banner (Arbor Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dbe1dd] bg-white p-4 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-[#1b2129] tracking-tight">
              {currentDayName}&apos;s Free Study Rooms
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#e3f5ec] text-[#005047] border border-[#00875f]/30">
              Week {selectedWeek} • Periods 1 – 5
            </span>
          </div>
          <p className="text-xs text-[#596560] mt-0.5">
            Click any period to see all free study rooms, teachers, and scheduled lessons in that block.
          </p>
        </div>

        {currentUser?.currentClaimedRoom && currentUser.currentClaimedRoom.dayOfWeek === selectedDay && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#e3f5ec] px-3 py-1.5 text-xs font-bold text-[#005047] border border-[#00875f]">
            <CheckCircle2 className="h-4 w-4 text-[#00875f]" />
            <span>Currently in Room {currentUser.currentClaimedRoom.roomCode}</span>
          </div>
        )}
      </div>

      {/* The 6 Period Cards (Form + Periods 1 to 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {periods.map(period => {
          const periodStudyRooms = studyRooms.filter(
            r => r.dayOfWeek === selectedDay && r.periodId === period.id
          );

          const isClaimedInThisPeriod = 
            currentUser?.currentClaimedRoom?.periodId === period.id && 
            currentUser?.currentClaimedRoom?.dayOfWeek === selectedDay;

          return (
            <div
              key={period.id}
              onClick={() => setActivePeriodDetails({ period, day: selectedDay })}
              className={`group relative flex flex-col justify-between rounded-xl border bg-white p-4 transition-all duration-150 cursor-pointer shadow-2xs hover:border-[#00875f] hover:shadow-sm ${
                isClaimedInThisPeriod
                  ? 'border-[#00875f] ring-2 ring-[#00875f]/20 bg-[#e3f5ec]/20'
                  : 'border-[#dbe1dd]'
              }`}
            >
              <div>
                {/* Period Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#eaeeec]">
                  <div>
                    <span className="text-sm font-extrabold text-[#1b2129]">
                      {period.name}
                    </span>
                    <div className="text-[11px] font-mono text-[#6f7a75]">
                      {period.startTime} – {period.endTime}
                    </div>
                  </div>

                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    periodStudyRooms.length > 0 
                      ? 'bg-[#e3f5ec] text-[#005047] border border-[#00875f]/40' 
                      : 'bg-[#f2f5f3] text-[#6f7a75]'
                  }`}>
                    {periodStudyRooms.length}
                  </span>
                </div>

                {/* Free Rooms List */}
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] font-bold text-[#596560] uppercase tracking-wider">
                    Free Study Spaces
                  </div>

                  {periodStudyRooms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {periodStudyRooms.map(room => (
                        <div
                          key={room.id}
                          className="flex items-center gap-1.5 rounded-md bg-[#e3f5ec] border border-[#00875f] px-2.5 py-1 text-xs font-extrabold text-[#005047] shadow-2xs"
                        >
                          <span className="h-2 w-2 rounded-full bg-[#00875f]" />
                          <span>Room {room.roomCode}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md bg-[#f9fbf9] p-2 text-center text-xs text-[#78827e] border border-dashed border-[#dbe1dd]">
                      No study rooms logged
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="mt-4 pt-2.5 border-t border-[#eaeeec] flex items-center justify-between text-xs font-bold text-[#005047] group-hover:text-[#00875f]">
                <span>Inspect Period</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Weekly Timetable Grid Table (Arbor MIS Style) */}
      <div className="mt-8 rounded-xl border border-[#dbe1dd] bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#dbe1dd] flex items-center justify-between bg-[#fafbfc]">
          <div>
            <h2 className="text-sm font-bold text-[#1b2129]">
              Week {selectedWeek} Complete Timetable Grid
            </h2>
            <p className="text-xs text-[#596560]">
              Aggregated 6th form study rooms across Monday – Friday
            </p>
          </div>

          <button
            onClick={() => setIsAddFreeRoomModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-[#005047] hover:text-[#00875f]"
          >
            <Plus className="h-3.5 w-3.5" /> Add Free Room
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f2f5f3] border-b border-[#dbe1dd] text-[#1b2129] font-bold">
                <th className="p-3.5 min-w-[120px] border-r border-[#dbe1dd]">Day</th>
                {periods.map(p => (
                  <th key={p.id} className="p-3 text-center min-w-[130px] border-r border-[#dbe1dd]">
                    <div>{p.name}</div>
                    <div className="text-[10px] font-mono text-[#596560] font-normal">{p.startTime} – {p.endTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeeec]">
              {days.map(d => {
                const isSelected = selectedDay === d.id;

                return (
                  <tr 
                    key={d.id}
                    className={`hover:bg-[#f2f5f3]/70 transition-colors ${
                      isSelected ? 'bg-[#e3f5ec]/40' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold border-r border-[#dbe1dd]">
                      <button
                        onClick={() => setSelectedDay(d.id)}
                        className={`text-left hover:underline ${
                          isSelected ? 'text-[#005047] font-black' : 'text-[#1b2129]'
                        }`}
                      >
                        {d.name}
                      </button>
                    </td>

                    {periods.map(p => {
                      const roomsInSlot = studyRooms.filter(
                        r => r.dayOfWeek === d.id && r.periodId === p.id
                      );

                      return (
                        <td 
                          key={p.id}
                          onClick={() => setActivePeriodDetails({ period: p, day: d.id })}
                          className="p-2 border-r border-[#dbe1dd] cursor-pointer hover:bg-[#e3f5ec]/60"
                        >
                          {roomsInSlot.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {roomsInSlot.map(r => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center rounded bg-[#e3f5ec] px-2 py-0.5 text-[11px] font-bold text-[#005047] border border-[#00875f]/50"
                                >
                                  {r.roomCode}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#b8c2be] block text-center">
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
