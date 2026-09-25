'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Period, FreeStudyRoom, ClassLesson } from '@/types';
import {
  WRENN_PERIODS,
  DAYS_OF_WEEK,
  PARSED_WEEK_A,
  PARSED_WEEK_B,
  cleanRoomCode,
  isRoomOccupiedByClass,
  getCurrentSchoolWeek,
  getFormattedCurrentDate
} from '@/lib/crowdsourceEngine';
import confetti from 'canvas-confetti';

// Versioning stamp: forces fresh login on each new deployment
const APP_DEPLOY_BUILD = 'freerooms_deploy_v11_clean_reset';

export interface ArborStudentSession {
  name: string;
  email: string;
  studentId?: number;
  schoolUrl: string;
  loggedInAt: string;
}

interface ArborMatrixContextType {
  isHydrated: boolean;
  periods: Period[];
  days: typeof DAYS_OF_WEEK;
  selectedDay: number; // 1=Mon .. 5=Fri
  setSelectedDay: (d: number) => void;
  selectedWeek: 'A' | 'B';
  setSelectedWeek: (w: 'A' | 'B') => void;
  liveCurrentWeek: 'A' | 'B';
  currentDateFormatted: string;

  // Filtered Study Rooms (NO overlaps with scheduled teaching classes) & Classes
  studyRooms: FreeStudyRoom[];
  allLessons: ClassLesson[];

  // Direct Arbor Student Session
  studentSession: ArborStudentSession | null;
  arborLogin: (schoolUrl: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutStudent: () => void;

  // Manual Free Room submission (Instant UI update + Anonymous MongoDB Atlas sync)
  addManualFreeRoom: (roomCode: string, dayOfWeek: number, periodId: string, notes?: string, targetWeek?: 'A' | 'B') => Promise<{ success: boolean; error?: string }>;
  deleteFreeRoom: (id: string) => void;

  // Background Sync
  lastSyncedAt: Date | null;
  refreshMatrixNow: () => Promise<void>;

  // Modal states
  activePeriodDetails: { period: Period; day: number } | null;
  setActivePeriodDetails: (details: { period: Period; day: number } | null) => void;
  isAddFreeRoomModalOpen: boolean;
  setIsAddFreeRoomModalOpen: (open: boolean) => void;
}

const ArborMatrixContext = createContext<ArborMatrixContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BUILD_VERSION: 'arbor_deploy_build_v11',
  SESSION: 'arbor_student_session_v11',
  MANUAL_ROOMS_A: 'arbor_manual_rooms_a_v11',
  MANUAL_ROOMS_B: 'arbor_manual_rooms_b_v11',
  SELECTED_WEEK: 'arbor_selected_week_v11',
};

export function ArborMatrixProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Live real-time academic calendar data
  const liveCurrentWeek = getCurrentSchoolWeek();
  const currentDateFormatted = getFormattedCurrentDate();

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) return today;
    return 1;
  });

  const [selectedWeek, setSelectedWeek] = useState<'A' | 'B'>(() => liveCurrentWeek);
  const [manualRoomsA, setManualRoomsA] = useState<FreeStudyRoom[]>([]);
  const [manualRoomsB, setManualRoomsB] = useState<FreeStudyRoom[]>([]);
  const [allLessonsA, setAllLessonsA] = useState<ClassLesson[]>([]);
  const [allLessonsB, setAllLessonsB] = useState<ClassLesson[]>([]);
  const [studentSession, setStudentSession] = useState<ArborStudentSession | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [activePeriodDetails, setActivePeriodDetails] = useState<{ period: Period; day: number } | null>(null);
  const [isAddFreeRoomModalOpen, setIsAddFreeRoomModalOpen] = useState(false);

  // Background sync fetcher from MongoDB Atlas (Pure DB - NO hardcoded rooms)
  const fetchRemoteRooms = useCallback(async () => {
    try {
      const emailParam = studentSession?.email ? `&userEmail=${encodeURIComponent(studentSession.email)}` : '';
      const [resA, resB] = await Promise.all([
        fetch(`/api/rooms/manual?week=A${emailParam}`).catch(() => null),
        fetch(`/api/rooms/manual?week=B${emailParam}`).catch(() => null),
      ]);

      if (resA && resA.ok) {
        const dataA = await resA.json();
        if (dataA.studyRooms && Array.isArray(dataA.studyRooms)) {
          setManualRoomsA(dataA.studyRooms);
        }
        if (dataA.occupiedLessons && Array.isArray(dataA.occupiedLessons)) {
          setAllLessonsA(dataA.occupiedLessons);
        }
      }

      if (resB && resB.ok) {
        const dataB = await resB.json();
        if (dataB.studyRooms && Array.isArray(dataB.studyRooms)) {
          setManualRoomsB(dataB.studyRooms);
        }
        if (dataB.occupiedLessons && Array.isArray(dataB.occupiedLessons)) {
          setAllLessonsB(dataB.occupiedLessons);
        }
      }

      setLastSyncedAt(new Date());
    } catch (err) {
      // Graceful fallback
    }
  }, [studentSession?.email]);

  // 1. Initial load from localStorage with deployment version check
  useEffect(() => {
    try {
      const savedBuild = localStorage.getItem(STORAGE_KEYS.BUILD_VERSION);

      // On new deployment: require fresh login
      if (savedBuild !== APP_DEPLOY_BUILD) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.setItem(STORAGE_KEYS.BUILD_VERSION, APP_DEPLOY_BUILD);
        setStudentSession(null);
      } else {
        const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (savedSession) setStudentSession(JSON.parse(savedSession));
      }

      const savedWeek = localStorage.getItem(STORAGE_KEYS.SELECTED_WEEK);
      if (savedWeek === 'A' || savedWeek === 'B') {
        setSelectedWeek(savedWeek);
      } else {
        setSelectedWeek(liveCurrentWeek);
      }

      const savedA = localStorage.getItem(STORAGE_KEYS.MANUAL_ROOMS_A);
      if (savedA) {
        const parsedA = JSON.parse(savedA);
        if (Array.isArray(parsedA) && parsedA.length > 0) setManualRoomsA(parsedA);
      }

      const savedB = localStorage.getItem(STORAGE_KEYS.MANUAL_ROOMS_B);
      if (savedB) {
        const parsedB = JSON.parse(savedB);
        if (Array.isArray(parsedB) && parsedB.length > 0) setManualRoomsB(parsedB);
      }
    } catch (e) {
      console.warn('Failed reading from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }

    // Initial background sync
    fetchRemoteRooms();

    // 2. Automated 5-minute background auto-refresh
    const interval = setInterval(() => {
      fetchRemoteRooms();
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, [fetchRemoteRooms, liveCurrentWeek]);

  // Save to localStorage ONLY AFTER hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_WEEK, selectedWeek);
    } catch {}
  }, [selectedWeek, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MANUAL_ROOMS_A, JSON.stringify(manualRoomsA));
    } catch {}
  }, [manualRoomsA, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MANUAL_ROOMS_B, JSON.stringify(manualRoomsB));
    } catch {}
  }, [manualRoomsB, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (studentSession) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(studentSession));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch {}
  }, [studentSession, isHydrated]);

  // All timetabled teaching classes for currently selected week (Live from MongoDB Atlas)
  const allLessons = selectedWeek === 'A'
    ? (allLessonsA.length > 0 ? allLessonsA : PARSED_WEEK_A.lessons)
    : (allLessonsB.length > 0 ? allLessonsB : PARSED_WEEK_B.lessons);

  // Combine study rooms purely from MongoDB Atlas (Live DB records)
  const rawStudyRooms = selectedWeek === 'A'
    ? manualRoomsA
    : manualRoomsB;

  // Deduplicate and clean room codes
  const dedupedMap = new Map<string, FreeStudyRoom>();
  rawStudyRooms.forEach(room => {
    const clean = cleanRoomCode(room.roomCode);
    if (clean) {
      const key = `${clean}-${room.dayOfWeek}-${room.periodId}`;
      dedupedMap.set(key, {
        ...room,
        roomCode: clean
      });
    }
  });

  const studyRooms = Array.from(dedupedMap.values());

  // Direct Arbor Login
  const arborLogin = async (schoolUrl: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/arbor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolUrl: schoolUrl || 'https://wrenn-school.uk.arbor.sc',
          username: email,
          password: pass,
          autoRenew: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'Invalid Arbor credentials. Please check your username and password.',
        };
      }

      const newSession: ArborStudentSession = {
        name: data.sessionInfo?.studentName || (email.toLowerCase().includes('localhost') ? 'System Administrator' : 'Student'),
        email: email.trim(),
        studentId: data.sessionInfo?.studentId || 10433,
        schoolUrl: schoolUrl || 'https://wrenn-school.uk.arbor.sc',
        loggedInAt: new Date().toISOString(),
      };

      setStudentSession(newSession);

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#7fb743', '#59862b', '#94cb58'],
        });
      } catch {}

      // Refresh matrix with any newly ingested student study rooms
      await fetchRemoteRooms();

      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Error connecting to Arbor.',
      };
    }
  };

  const logoutStudent = () => {
    setStudentSession(null);
  };

  // Add Free Room with Instant UI update, MongoDB Atlas sync & Collision check
  const addManualFreeRoom = async (
    roomCode: string,
    dayOfWeek: number,
    periodId: string,
    notes?: string,
    targetWeek?: 'A' | 'B'
  ): Promise<{ success: boolean; error?: string }> => {
    // Split on commas, semicolons, or slashes (e.g. "6C, 6D" -> ["6C", "6D"])
    const rawCodes = String(roomCode).split(/[,;/]+/).map(s => cleanRoomCode(s)).filter(Boolean);
    if (rawCodes.length === 0) return { success: false, error: 'Valid room code is required.' };

    const effectiveWeek = targetWeek || selectedWeek;
    const targetLessons = effectiveWeek === 'A'
      ? (allLessonsA.length > 0 ? allLessonsA : PARSED_WEEK_A.lessons)
      : (allLessonsB.length > 0 ? allLessonsB : PARSED_WEEK_B.lessons);
    const isAdmin = studentSession?.email?.toLowerCase().trim() === 'localhost@localhost';

    // 1. Client-Side Collision Check (Instant UI warning if occupied by class)
    if (!isAdmin) {
      for (const code of rawCodes) {
        const collision = targetLessons.find(
          l => l.dayOfWeek === dayOfWeek &&
               l.periodId === periodId &&
               cleanRoomCode(l.roomCode) === code &&
               !l.isStudy
        );
        if (collision) {
          return {
            success: false,
            error: `Room ${code} is unavailable: occupied by ${collision.subject}${collision.teacher ? ` with ${collision.teacher}` : ''} in this period.`
          };
        }
      }
    }

    const period = WRENN_PERIODS.find(p => p.id === periodId) || WRENN_PERIODS[0];
    const dayObj = DAYS_OF_WEEK.find(d => d.id === dayOfWeek) || DAYS_OF_WEEK[0];

    // 2. Persist each room to Backend / MongoDB Atlas
    try {
      for (const cleanCode of rawCodes) {
        const res = await fetch('/api/rooms/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomCode: cleanCode,
            weekType: effectiveWeek,
            dayOfWeek,
            periodId: period.id,
            notes,
            userEmail: studentSession?.email || 'user@freerooms',
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return {
            success: false,
            error: data.error || `Room ${cleanCode} is unavailable in this period.`
          };
        }
      }

      setIsAddFreeRoomModalOpen(false);
      await fetchRemoteRooms();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error saving room to server.' };
    }
  };

  const deleteFreeRoom = async (id: string) => {
    // 1. Optimistically remove from state
    if (selectedWeek === 'A') {
      setManualRoomsA(prev => prev.filter(r => r.id !== id));
    } else {
      setManualRoomsB(prev => prev.filter(r => r.id !== id));
    }

    // 2. Perform backend delete with user email
    const emailParam = studentSession?.email ? `&userEmail=${encodeURIComponent(studentSession.email)}` : '';
    try {
      const res = await fetch(`/api/rooms/manual?id=${encodeURIComponent(id)}${emailParam}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('Delete rejected by backend:', data.error);
      }
    } catch (err) {
      console.warn('Failed deleting room from server:', err);
    } finally {
      // 3. Resync authoritative list from MongoDB Atlas
      await fetchRemoteRooms();
    }
  };

  return (
    <ArborMatrixContext.Provider
      value={{
        isHydrated,
        periods: WRENN_PERIODS,
        days: DAYS_OF_WEEK,
        selectedDay,
        setSelectedDay,
        selectedWeek,
        setSelectedWeek,
        liveCurrentWeek,
        currentDateFormatted,
        studyRooms,
        allLessons,
        studentSession,
        arborLogin,
        logoutStudent,
        addManualFreeRoom,
        deleteFreeRoom,
        lastSyncedAt,
        refreshMatrixNow: fetchRemoteRooms,
        activePeriodDetails,
        setActivePeriodDetails,
        isAddFreeRoomModalOpen,
        setIsAddFreeRoomModalOpen,
      }}
    >
      {children}
    </ArborMatrixContext.Provider>
  );
}

export function useArborMatrix() {
  const context = useContext(ArborMatrixContext);
  if (!context) {
    throw new Error('useArborMatrix must be used within an ArborMatrixProvider');
  }
  return context;
}
