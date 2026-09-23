'use client';

import React from 'react';
import { useRooms } from '@/context/RoomContext';
import { 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  Table2, 
  Map, 
  Check, 
  X,
  Sparkles,
  Building
} from 'lucide-react';
import { DEFAULT_BLOCKS } from '@/lib/schoolData';

interface FilterToolbarProps {
  currentView: 'cards' | 'matrix' | 'map';
  setCurrentView: (v: 'cards' | 'matrix' | 'map') => void;
}

const COMMON_FEATURES = [
  'Interactive Display',
  'PCs (30)',
  'Silent Study',
  'Power Outlets',
  'Air Conditioning',
  'Whiteboards',
  'Gas Taps'
];

export function FilterToolbar({ currentView, setCurrentView }: FilterToolbarProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedBlock,
    setSelectedBlock,
    selectedType,
    setSelectedType,
    statusFilter,
    setStatusFilter,
    selectedFeatures,
    toggleFeatureFilter,
    freeRoomsCount
  } = useRooms();

  return (
    <div className="space-y-3">
      {/* Top row: Search input, status tabs, and view mode toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search room (e.g. 6D, 6B), subject, block, teacher..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            All Rooms
          </button>
          <button
            onClick={() => setStatusFilter('free_now')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'free_now'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Free Now ({freeRoomsCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('free_1hr')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'free_1hr'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Free &gt; 1 Hour
          </button>
          <button
            onClick={() => setStatusFilter('occupied')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'occupied'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400'
            }`}
          >
            Occupied
          </button>
          <button
            onClick={() => setStatusFilter('my_rooms')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'my_rooms'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400'
            }`}
          >
            My Assigned / Swapped
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setCurrentView('cards')}
            title="Card Grid View"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              currentView === 'cards'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setCurrentView('matrix')}
            title="Period Timetable Matrix"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              currentView === 'matrix'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Table2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Periods Matrix</span>
          </button>
          <button
            onClick={() => setCurrentView('map')}
            title="Campus & Floor Map"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
              currentView === 'map'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Floor Plan</span>
          </button>
        </div>
      </div>

      {/* Block & Equipment Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mr-1">
          <Building className="h-3.5 w-3.5" /> Block:
        </span>

        <button
          onClick={() => setSelectedBlock('All')}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
            selectedBlock === 'All'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:hover:bg-zinc-800'
          }`}
        >
          All Blocks
        </button>

        {DEFAULT_BLOCKS.map(block => (
          <button
            key={block}
            onClick={() => setSelectedBlock(selectedBlock === block ? 'All' : block)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              selectedBlock === block
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800/70 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            {block}
          </button>
        ))}

        {/* Feature quick tags */}
        <div className="ml-auto hidden xl:flex items-center gap-1.5">
          <span className="text-xs text-zinc-400">Features:</span>
          {COMMON_FEATURES.slice(0, 4).map(feat => {
            const isSelected = selectedFeatures.includes(feat);
            return (
              <button
                key={feat}
                onClick={() => toggleFeatureFilter(feat)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {feat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
