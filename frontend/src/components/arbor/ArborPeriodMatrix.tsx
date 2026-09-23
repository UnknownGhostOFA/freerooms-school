'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import { Period, FreeStudyRoom } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  User, 
  Info,
  Layers,
  ArrowRight
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
    claimStudyRoom,
  } = useArborMatrix();

  const currentDayName = days.find(d => d.id === selectedDay)?.name || 'Today';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Arbor-style clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{currentDayName}&apos;s Free Study Rooms</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Week {selectedWeek} • Periods 1 – 5
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Click any period to view all study rooms, student groups, and lessons in that period.
          </p>
        </div>

        {currentUser?.currentClaimedRoom && currentUser.currentClaimedRoom.dayOfWeek === selectedDay && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>You are studying in Room {currentUser.currentClaimedRoom.roomCode}</span>
          </div>
        )}
      </div>

      {/* The 5 Periods Grid - Clean Arbor Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {periods.map(period => {
          // Get free study rooms for this period on this day
          const periodStudyRooms = studyRooms.filter(
            r => r.dayOfWeek === selectedDay && r.periodId === period.id
          );

          // Get all scheduled lessons for this period on this day
          const periodLessons = allLessons.filter(
            l => l.dayOfWeek === selectedDay && l.periodId === period.id
          );

          const isClaimedInThisPeriod = 
            currentUser?.currentClaimedRoom?.periodId === period.id && 
            currentUser?.currentClaimedRoom?.dayOfWeek === selectedDay;

          return (
            <div
              key={period.id}
              onClick={() => setActivePeriodDetails({ period, day: selectedDay })}
              className={`group relative flex flex-col justify-between rounded-xl border p-4 bg-white dark:bg-zinc-900 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md hover:border-emerald-500 ${
                isClaimedInThisPeriod
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div>
                {/* Period Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {period.name}
                    </span>
                    <div className="text-[11px] font-medium text-zinc-400">
                      {period.startTime} – {period.endTime}
                    </div>
                  </div>

                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    periodStudyRooms.length > 0 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                  }`}>
                    {periodStudyRooms.length}
                  </span>
                </div>

                {/* Free Study Rooms List */}
                <div className="mt-3 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Free Study Rooms
                  </div>

                  {periodStudyRooms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {periodStudyRooms.map(room => (
                        <div
                          key={room.id}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200 shadow-2xs"
                        >
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span>Room {room.roomCode}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/40 p-2.5 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800">
                      No study rooms logged yet
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800">
                <span>View All Classes</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Full Matrix Table View (Pure Arbor Style) */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Weekly Free Study Rooms Timetable Grid
            </h2>
            <p className="text-xs text-zinc-400">
              Unified schedule across Monday to Friday for Periods 1, 2, 3, 4, 5
            </p>
          </div>

          <button
            onClick={() => setIsAddFreeRoomModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
          >
            <Plus className="h-3.5 w-3.5" /> Add Free Room
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                <th className="p-3.5 min-w-[110px] border-r border-zinc-200 dark:border-zinc-800">Day</th>
                {periods.map(p => (
                  <th key={p.id} className="p-3.5 text-center min-w-[130px] border-r border-zinc-200 dark:border-zinc-800">
                    <div>{p.name}</div>
                    <div className="text-[10px] font-normal text-zinc-400">{p.startTime} - {p.endTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {days.map(d => {
                const isSelected = selectedDay === d.id;

                return (
                  <tr 
                    key={d.id}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                      isSelected ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold border-r border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={() => setSelectedDay(d.id)}
                        className={`text-left hover:underline ${isSelected ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-zinc-900 dark:text-zinc-100'}`}
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
                          className="p-2 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40"
                        >
                          {roomsInSlot.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {roomsInSlot.map(r => (
                                <span
                                  key={r.id}
                                  className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                >
                                  {r.roomCode}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-300 dark:text-zinc-600 block text-center">
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
