'use client';

import React, { useState } from 'react';
import { useRooms } from '@/context/RoomContext';
import { parseArborCSV, parseICS } from '@/lib/importers';
import { 
  UploadCloud, 
  X, 
  FileText, 
  Calendar, 
  Sparkles, 
  Check, 
  AlertCircle,
  Link as LinkIcon,
  RotateCcw
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const { rooms, importBookings, resetAllData } = useRooms();

  const [activeTab, setActiveTab] = useState<'csv' | 'ical' | 'teams' | 'presets'>('csv');
  const [csvText, setCsvText] = useState('');
  const [icalText, setIcalText] = useState('');
  const [calendarUrl, setCalendarUrl] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle CSV import
  const handleImportCSV = () => {
    if (!csvText.trim()) return;

    try {
      const { bookings: importedBookings, newRooms } = parseArborCSV(csvText, rooms);
      if (importedBookings.length === 0) {
        setImportStatus('No valid timetable rows found in CSV. Please verify column headers.');
        return;
      }

      importBookings(importedBookings, newRooms);
      setImportStatus(`Successfully imported ${importedBookings.length} sessions from Arbor timetable!`);
      setTimeout(() => {
        onClose();
        setImportStatus(null);
      }, 1500);
    } catch (e: any) {
      setImportStatus(`Import error: ${e?.message || 'Failed to parse CSV'}`);
    }
  };

  // Handle iCal import
  const handleImportICS = () => {
    if (!icalText.trim()) return;

    try {
      const importedBookings = parseICS(icalText, rooms);
      if (importedBookings.length === 0) {
        setImportStatus('No VEVENT blocks matching school rooms found in iCal data.');
        return;
      }

      importBookings(importedBookings);
      setImportStatus(`Successfully synced ${importedBookings.length} events from calendar!`);
      setTimeout(() => {
        onClose();
        setImportStatus(null);
      }, 1500);
    } catch (e: any) {
      setImportStatus(`Import error: ${e?.message || 'Failed to parse ICS'}`);
    }
  };

  // Load sample Arbor CSV snippet
  const loadSampleArborCSV = () => {
    const sample = `Period,Start Time,End Time,Room,Subject,Teacher,Day
Period 1,08:50,09:50,6B,A-Level Maths,Dr. Evans,Monday
Period 2,09:50,10:50,6B,Psychology,Mrs. Bennett,Monday
Period 4,12:10,13:10,6D,Economics Workshop,Mr. Wright,Monday
Period 2,09:50,10:50,LAB-1,Chemistry Practical,Dr. Sharma,Monday
Period 3,11:10,12:10,CS-1,Computer Science,Mr. Clark,Monday
Period 1,08:50,09:50,6C,English Lang,Ms. Taylor,Monday`;
    setCsvText(sample);
  };

  // Load sample Teams iCal
  const loadSampleTeamsICS = () => {
    const sample = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN
BEGIN:VEVENT
UID:teams-event-001
SUMMARY:Teams Meeting - Sixth Form Study & Revision
LOCATION:Room 6A
DTSTART:20260921T100000Z
DTEND:20260921T110000Z
DESCRIPTION:Virtual Q&A Revision on Microsoft Teams. Staff: Mr. Davis
END:VEVENT
BEGIN:VEVENT
UID:teams-event-002
SUMMARY:Virtual Staff Briefing
LOCATION:Room 6D
DTSTART:20260921T140000Z
DTEND:20260921T150000Z
DESCRIPTION:Weekly Briefing. Organiser: SLT
END:VEVENT
END:VCALENDAR`;
    setIcalText(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Sync Arbor & Microsoft Teams Timetables
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Import CSV schedules or live iCal calendar feeds
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

        {/* Tab switcher */}
        <div className="mt-4 flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('csv')}
            className={`flex-1 rounded-lg py-1.5 transition-all ${
              activeTab === 'csv'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Arbor CSV Export
          </button>
          <button
            onClick={() => setActiveTab('ical')}
            className={`flex-1 rounded-lg py-1.5 transition-all ${
              activeTab === 'ical'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            iCal / .ICS Feed
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 rounded-lg py-1.5 transition-all ${
              activeTab === 'teams'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            Microsoft Teams
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 rounded-lg py-1.5 transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
            }`}
          >
            School Presets
          </button>
        </div>

        {/* Tab 1: CSV */}
        {activeTab === 'csv' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Paste Arbor Timetable CSV content
              </label>
              <button
                type="button"
                onClick={loadSampleArborCSV}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Load Sample Arbor CSV
              </button>
            </div>

            <textarea
              rows={8}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="Period,Start Time,End Time,Room,Subject,Teacher,Day&#10;Period 1,08:50,09:50,6B,A-Level Maths,Dr. Evans,Monday&#10;Period 2,09:50,10:50,6B,Psychology,Mrs. Bennett,Monday"
              className="w-full font-mono text-xs rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />

            <p className="text-[11px] text-zinc-400">
              Columns recognized: <code className="font-semibold text-zinc-600 dark:text-zinc-300">Room, Subject, Start Time, End Time, Day/Date, Teacher, Period</code>.
            </p>

            <button
              onClick={handleImportCSV}
              disabled={!csvText.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Import Arbor Timetable</span>
            </button>
          </div>
        )}

        {/* Tab 2: iCal */}
        {activeTab === 'ical' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Paste iCalendar (.ics) Content
              </label>
              <button
                type="button"
                onClick={loadSampleTeamsICS}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Load Sample iCal
              </button>
            </div>

            <textarea
              rows={8}
              value={icalText}
              onChange={e => setIcalText(e.target.value)}
              placeholder="BEGIN:VCALENDAR&#10;BEGIN:VEVENT&#10;SUMMARY:Maths Class&#10;LOCATION:Room 6B&#10;DTSTART:20260921T090000Z&#10;DTEND:20260921T100000Z&#10;END:VEVENT&#10;END:VCALENDAR"
              className="w-full font-mono text-xs rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />

            <button
              onClick={handleImportICS}
              disabled={!icalText.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Import iCal Calendar Feed</span>
            </button>
          </div>
        )}

        {/* Tab 3: Microsoft Teams */}
        {activeTab === 'teams' && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-indigo-50/70 p-3.5 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5" /> Microsoft 365 / Teams Calendar Sync
              </h4>
              <p className="text-zinc-600 dark:text-zinc-300">
                To sync your school Teams classes or meeting rooms, copy your Outlook/Teams shared calendar `.ics` URL or export the iCalendar file.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Teams / Outlook iCal URL
              </label>
              <input
                type="url"
                value={calendarUrl}
                onChange={e => setCalendarUrl(e.target.value)}
                placeholder="https://outlook.office365.com/owa/calendar/.../reachcalendar.ics"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                loadSampleTeamsICS();
                setActiveTab('ical');
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50/60 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load Mock Teams Timetable Stream</span>
            </button>
          </div>
        )}

        {/* Tab 4: Reset / Demo Presets */}
        {activeTab === 'presets' && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-zinc-200 p-4 text-xs space-y-2 dark:border-zinc-800">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                Reset or Restore Demo Database
              </h4>
              <p className="text-zinc-500">
                Restore default school dataset with 20+ rooms (including 6A, 6B, 6C, 6D, Science Labs, Computer Suites) and real-time period timetable.
              </p>
              <button
                onClick={() => {
                  resetAllData();
                  setImportStatus('Reset back to standard Oakridge Academy demo dataset.');
                  setTimeout(() => {
                    onClose();
                    setImportStatus(null);
                  }, 1200);
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default School Timetable</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {importStatus && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}
