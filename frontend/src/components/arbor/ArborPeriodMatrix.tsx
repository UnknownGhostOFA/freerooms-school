'use client';

import React, { useState } from 'react';
import { useArborMatrix } from '@/context/ArborMatrixContext';
import {
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  LayoutGrid,
  Table2,
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
    liveCurrentWeek,
    studyRooms,
    setActivePeriodDetails,
    setIsAddFreeRoomModalOpen,
    lastSyncedAt,
    refreshMatrixNow
  } = useArborMatrix();

  const [mobileView, setMobileView] = useState<'cards' | 'table'>('cards');
  const [isSyncing, setIsSyncing] = useState(false);

  const currentDayName = days.find(d => d.id === selectedDay)?.name || 'Today';

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await refreshMatrixNow();
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  // Total free rooms available today
  const todaysRoomsCount = studyRooms.filter(r => r.dayOfWeek === selectedDay).length;

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-6 space-y-3.5 sm:space-y-6">
      {/* Title Header Banner (Mobile Stacked, Tablet/Desktop Inline) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#1a201c] p-3.5 sm:p-5 rounded-2xl shadow-2xs transition-colors">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-xl font-black text-[#1b2129] dark:text-[#f0f4f1] tracking-tight">
              {currentDayName}&apos;s Free Study Rooms
            </h1>
            <span className="text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-md bg-[#edf6e4] dark:bg-[#233120] text-[#7fb743] border border-[#7fb743]/30">
              Week {selectedWeek} {selectedWeek === liveCurrentWeek ? '• Live' : ''}
            </span>
            <span className="text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-md bg-[#fef4e8] dark:bg-[#2d1d0e] text-[#c87010] dark:text-[#fbc27b] border border-[#f8a340]/40">
              {todaysRoomsCount} {todaysRoomsCount === 1 ? 'room' : 'rooms'} today
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#596560] dark:text-[#8b9c92]">
            Real-time study spaces with zero class collisions • Auto-syncs with Arbor
          </p>
        </div>

        {/* Action Controls & Mobile Segmented Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2.5 sm:pt-0 border-t border-[#eaeeec] dark:border-[#28332c] sm:border-0">
          {/* Mobile view segmented switch */}
          <div className="flex sm:hidden items-center bg-[#f2f5f3] dark:bg-[#151b17] p-1 rounded-xl border border-[#dbe1dd] dark:border-[#28332c] text-xs font-bold">
            <button
              onClick={() => setMobileView('cards')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all touch-manipulation ${
                mobileView === 'cards'
                  ? 'bg-white dark:bg-[#222c25] text-[#1b2129] dark:text-white shadow-2xs font-extrabold'
                  : 'text-[#596560] dark:text-[#8b9c92]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setMobileView('table')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all touch-manipulation ${
                mobileView === 'table'
                  ? 'bg-white dark:bg-[#222c25] text-[#1b2129] dark:text-white shadow-2xs font-extrabold'
                  : 'text-[#596560] dark:text-[#8b9c92]'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              title="Refresh room matrix from database"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#dbe1dd] dark:border-[#28332c] bg-[#fafbfc] dark:bg-[#222c25] px-3 py-2 text-xs sm:text-sm font-semibold text-[#596560] dark:text-[#a0b0a6] hover:bg-[#f2f5f3] dark:hover:bg-[#2a372f] hover:text-[#1b2129] dark:hover:text-white cursor-pointer transition-colors active:scale-95 touch-manipulation"
            >
              <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isSyncing ? 'animate-spin text-[#7fb743]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={() => setIsAddFreeRoomModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#7fb743] px-3.5 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#689934] shadow-2xs cursor-pointer transition-all active:scale-95 touch-manipulation"
            >
              <Plus className="h-4 w-4" />
              <span>Add Free Room</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 5 Period Cards (Responsive: 1 col on Phone, 2-3 on Tablet, 5 on Desktop) */}
      <div className={`${mobileView === 'table' ? 'hidden sm:grid' : 'grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4`}>
        {periods.map(period => {
          const periodStudyRooms = studyRooms.filter(
            r => r.dayOfWeek === selectedDay && r.periodId === period.id
          );

          return (
            <div
              key={period.id}
              onClick={() => setActivePeriodDetails({ period, day: selectedDay })}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#1a201c] p-4 sm:p-5 transition-all duration-150 cursor-pointer shadow-2xs hover:border-[#7fb743] hover:shadow-md active:scale-[0.98] touch-manipulation"
            >
              <div>
                {/* Period Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#eaeeec] dark:border-[#28332c]">
                  <div>
                    <span className="text-base sm:text-lg font-black text-[#1b2129] dark:text-[#f0f4f1]">
                      {period.name}
                    </span>
                    <div className="text-xs font-mono text-[#6f7a75] dark:text-[#8b9c92] flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 inline text-[#7fb743]" />
                      <span>{period.startTime} – {period.endTime}</span>
                    </div>
                  </div>

                  <span className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shadow-2xs ${
                    periodStudyRooms.length > 0
                      ? 'bg-[#fef4e8] dark:bg-[#2d1d0e] text-[#c87010] dark:text-[#fbc27b] border border-[#f8a340]/40'
                      : 'bg-[#f2f5f3] dark:bg-[#222c25] text-[#6f7a75] dark:text-[#8b9c92]'
                  }`}>
                    {periodStudyRooms.length}
                  </span>
                </div>

                {/* Free Rooms List */}
                <div className="mt-3.5 space-y-2">
                  <div className="text-[10px] sm:text-[11px] font-extrabold text-[#596560] dark:text-[#8b9c92] uppercase tracking-wider">
                    Available Study Spaces
                  </div>

                  {periodStudyRooms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {periodStudyRooms.map(room => (
                        <div
                          key={room.id}
                          className="flex items-center gap-1.5 rounded-xl bg-[#fef4e8] dark:bg-[#2d1d0e] border border-[#f8a340] px-3 py-1.5 text-xs sm:text-sm font-black text-[#c87010] dark:text-[#fbc27b] shadow-2xs"
                        >
                          <span className="h-2 w-2 rounded-full bg-[#f8a340] animate-pulse shrink-0" />
                          <span>{room.roomCode}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#f9fbf9] dark:bg-[#151b17] p-3 text-center text-xs text-[#78827e] dark:text-[#8b9c92] border border-dashed border-[#dbe1dd] dark:border-[#28332c]">
                      No free rooms logged
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="mt-4 pt-3 border-t border-[#eaeeec] dark:border-[#28332c] flex items-center justify-between text-xs sm:text-sm font-bold text-[#7fb743] group-hover:text-[#689934]">
                <span>View All Details</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Weekly Timetable Grid Table (Enhanced touch scrolling for Tablets/Phones) */}
      <div className={`${mobileView === 'cards' ? 'hidden sm:block' : 'block'} mt-6 sm:mt-8 rounded-2xl border border-[#dbe1dd] dark:border-[#28332c] bg-white dark:bg-[#1a201c] overflow-hidden shadow-2xs transition-colors`}>
        <div className="p-3.5 sm:p-4 border-b border-[#dbe1dd] dark:border-[#28332c] flex items-center justify-between bg-[#fafbfc] dark:bg-[#151b17]">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#1b2129] dark:text-[#f0f4f1]">
              Week {selectedWeek} 5-Day Free Rooms Matrix
            </h2>
            <p className="text-xs text-[#596560] dark:text-[#8b9c92]">
              Tap any cell to inspect free study spaces and class schedules
            </p>
          </div>

          {lastSyncedAt && (
            <span className="text-[11px] text-[#596560] dark:text-[#8b9c92] font-mono">
              {lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[560px]">
            <thead>
              <tr className="bg-[#f2f5f3] dark:bg-[#151b17] border-b border-[#dbe1dd] dark:border-[#28332c] text-[#1b2129] dark:text-[#f0f4f1] font-bold">
                <th className="p-3 font-extrabold w-28 sm:w-32 sticky left-0 bg-[#f2f5f3] dark:bg-[#151b17] z-10">Period</th>
                {days.map(day => {
                  const isToday = new Date().getDay() === day.id;
                  return (
                    <th key={day.id} className={`p-3 font-extrabold border-l border-[#dbe1dd] dark:border-[#28332c] ${isToday ? 'bg-[#edf6e4] dark:bg-[#233120] text-[#7fb743]' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{day.name}</span>
                        {isToday && <span className="text-[9px] px-1 bg-[#d8ecc5] dark:bg-[#32452e] text-[#59862b] dark:text-[#94cb58] rounded font-mono">TODAY</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeeec] dark:divide-[#28332c]">
              {periods.map(period => (
                <tr key={period.id} className="hover:bg-[#fcfdfd] dark:hover:bg-[#222c25]/50 transition-colors">
                  <td className="p-3 bg-[#fafbfc] dark:bg-[#151b17] font-bold text-[#1b2129] dark:text-[#f0f4f1] sticky left-0 z-10">
                    <div>{period.name}</div>
                    <div className="text-[10px] sm:text-xs font-normal text-[#6f7a75] dark:text-[#8b9c92] font-mono">
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
                        className="p-2 sm:p-2.5 border-l border-[#eaeeec] dark:border-[#28332c] cursor-pointer hover:bg-[#fef4e8] dark:hover:bg-[#2d1d0e]/80 transition-colors touch-manipulation"
                      >
                        {roomsInCell.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {roomsInCell.map(r => (
                              <span
                                key={r.id}
                                className="inline-block px-2 py-0.5 rounded-md bg-[#fef4e8] dark:bg-[#2d1d0e] text-[#c87010] dark:text-[#fbc27b] font-black text-[11px] sm:text-xs border border-[#f8a340]/40 shadow-2xs"
                              >
                                {r.roomCode}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#a4ada8] dark:text-[#506056] text-[11px]">—</span>
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
