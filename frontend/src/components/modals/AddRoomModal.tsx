'use client';

import React, { useState } from 'react';
import { useRooms } from '@/context/RoomContext';
import { RoomType } from '@/types';
import { DEFAULT_BLOCKS } from '@/lib/schoolData';
import { X, Plus, Sparkles, Check } from 'lucide-react';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRoomModal({ isOpen, onClose }: AddRoomModalProps) {
  const { addRoom, quickSwapRoom } = useRooms();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [block, setBlock] = useState(DEFAULT_BLOCKS[0]);
  const [floor, setFloor] = useState('Floor 1');
  const [capacity, setCapacity] = useState(30);
  const [type, setType] = useState<RoomType>('classroom');
  const [featuresText, setFeaturesText] = useState('Interactive Display, Silent Study, Power Outlets');
  const [notes, setNotes] = useState('');
  const [autoAssign, setAutoAssign] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const parsedFeatures = featuresText
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const created = addRoom({
      code: code.trim().toUpperCase(),
      name: name.trim() || `Room ${code.trim().toUpperCase()}`,
      block,
      floor,
      capacity: Number(capacity) || 30,
      type,
      features: parsedFeatures,
      notes: notes.trim() || undefined,
    });

    if (autoAssign) {
      quickSwapRoom(created.id, `Created and assigned room ${created.code}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Manually Add a Room
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Add any room (e.g. 6D, Study Pod) and configure availability
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Room Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 6D, 6B, LAB-4"
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  if (!name) setName(`Room ${e.target.value.toUpperCase()}`);
                }}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Room Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sixth Form Study 6D"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                School Block / Building
              </label>
              <select
                value={block}
                onChange={e => setBlock(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                {DEFAULT_BLOCKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Floor
              </label>
              <select
                value={floor}
                onChange={e => setFloor(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="Ground">Ground Floor</option>
                <option value="Floor 1">Floor 1</option>
                <option value="Floor 2">Floor 2</option>
                <option value="Floor 3">Floor 3</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Room Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as RoomType)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="classroom">Classroom</option>
                <option value="study_room">Quiet Study Room</option>
                <option value="computer_lab">Computer Lab</option>
                <option value="science_lab">Science Lab</option>
                <option value="art_studio">Art Studio</option>
                <option value="music_practice">Music Practice Room</option>
                <option value="hall">Main Hall / Auditorium</option>
                <option value="staff_only">Staff Room</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Seating Capacity
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Features & Equipment (Comma separated)
            </label>
            <input
              type="text"
              value={featuresText}
              onChange={e => setFeaturesText(e.target.value)}
              placeholder="e.g. Interactive Display, Silent Study, Power Outlets, PCs (30)"
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={e => setAutoAssign(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Immediately make this my current assigned study room</span>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Room</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
