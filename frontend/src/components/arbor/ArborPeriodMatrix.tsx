'use client';

import React from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import {
  ChevronRight,
  Plus,
  RefreshCw,
  Calendar,
  Clock
} from 'lucide-react';

export function ArborPeriodMatrix() {
  const {
    periods,
    days,
    selectedDay,
    setSelectedDay,
    selectedWeek,
    liveCurrentWeek,
    currentDateFormatted,
    studyRooms,
    setActivePeriodDetails,
    setIsAddFreeRoomModalOpen,
    lastSyncedAt,
    refreshMatrixNow
  } = useArborMatrix();

  const currentDayName = days.find(d => d.id === selectedDay)?.name || 'Today';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Title Header Banner (Arbor Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dbe1dd] bg-white p-4 rounded-xl shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-[#1b2129] tracking-tight">
              {currentDayName}&apos;s Free Study Rooms
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#e3f5ec] text-[#005047] border border-[#00875f]/30">
              Week {selectedWeek} {selectedWeek === liveCurrentWeek ? '• Active Week' : ''}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#f2f5f3] text-[#596560] border border-[#dbe1dd] hidden sm:inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{currentDateFormatted}</span>
            </span>
          </div>
          <p className="text-xs text-[#596560] mt-0.5">
            Real-time anonymous study spaces with zero class overlaps. Auto-refreshes every 5 mins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshMatrixNow()}
            title="Refresh room matrix from database"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#dbe1dd] bg-[#fafbfc] px-3 py-1.5 text-xs font-semibold text-[#596560] hover:bg-[#f2f5f3] hover:text-[#1b2129]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsAddFreeRoomModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#005047] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#003630] shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Free Room</span>
          </button>
        </div>
      </div>

      {/* The 5 Period Cards (Periods 1 to 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {periods.map(period => {
          const periodStudyRooms = studyRooms.filter(
            r => r.dayOfWeek === selectedDay && r.periodId === period.id
          );

          return (
            <div
              key={period.id}
              onClick={() => setActivePeriodDetails({ period, day: selectedDay })}
              className="group relative flex flex-col justify-between rounded-xl border border-[#dbe1dd] bg-white p-4 transition-all duration-150 cursor-pointer shadow-2xs hover:border-[#00875f] hover:shadow-sm"
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
                    Available Rooms
                  </div>

                  {periodStudyRooms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {periodStudyRooms.map(room => (
                        <div
                          key={room.id}
                          className="flex items-center gap-1.5 rounded-md bg-[#e3f5ec] border border-[#00875f] px-2.5 py-1 text-xs font-black text-[#005047] shadow-2xs"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00875f]" />
                          <span>{room.roomCode}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md bg-[#f9fbf9] p-2 text-center text-xs text-[#78827e] border border-dashed border-[#dbe1dd]">
                      No free rooms logged
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
              Week {selectedWeek} Complete Free Rooms Matrix
            </h2>
            <p className="text-xs text-[#596560]">
              Mon – Fri overview across all school periods • {currentDateFormatted}
            </p>
          </div>

          {lastSyncedAt && (
            <span className="text-[11px] text-[#596560] font-mono">
              Last synced: {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f2f5f3] border-b border-[#dbe1dd] text-[#1b2129] font-bold">
                <th className="p-3 font-extrabold w-28">Period</th>
                {days.map(day => {
                  const isToday = new Date().getDay() === day.id;
                  return (
                    <th key={day.id} className={`p-3 font-extrabold border-l border-[#dbe1dd] ${isToday ? 'bg-emerald-50 text-[#005047]' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{day.name}</span>
                        {isToday && <span className="text-[9px] px-1 bg-emerald-200/70 text-[#005047] rounded font-mono">TODAY</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeeec]">
              {periods.map(period => (
                <tr key={period.id} className="hover:bg-[#fcfdfd]">
                  <td className="p-3 bg-[#fafbfc] font-bold text-[#1b2129]">
                    <div>{period.name}</div>
                    <div className="text-[10px] font-normal text-[#6f7a75] font-mono">
                      {period.startTime} – {period.endTime}
                    </div>
                  </td>

                  {days.map(day => {
                    const roomsInCell = studyRooms.filter(
                      r => r.dayOfWeek === day.id && r.periodId === period.id
                    );

                    return (
                      <td
                        key={day.id}
                        onClick={() => setActivePeriodDetails({ period, day: day.id })}
                        className="p-2.5 border-l border-[#eaeeec] cursor-pointer hover:bg-[#e3f5ec]/40 transition-colors"
                      >
                        {roomsInCell.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {roomsInCell.map(r => (
                              <span
                                key={r.id}
                                className="inline-block px-2 py-0.5 rounded bg-[#e3f5ec] text-[#005047] font-black text-[11px] border border-[#00875f]/40"
                              >
                                {r.roomCode}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#a4ada8] text-[11px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
