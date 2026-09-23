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
const APP_DEPLOY_BUILD = 'freerooms_deploy_v10_prod';

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
  addManualFreeRoom: (roomCode: string, dayOfWeek: number, periodId: string, notes?: string) => { success: boolean; error?: string };
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
  BUILD_VERSION: 'arbor_deploy_build_v10',
  SESSION: 'arbor_student_session_v10',
  MANUAL_ROOMS_A: 'arbor_manual_rooms_a_v10',
  MANUAL_ROOMS_B: 'arbor_manual_rooms_b_v10',
  SELECTED_WEEK: 'arbor_selected_week_v10',
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
  const [studentSession, setStudentSession] = useState<ArborStudentSession | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [activePeriodDetails, setActivePeriodDetails] = useState<{ period: Period; day: number } | null>(null);
  const [isAddFreeRoomModalOpen, setIsAddFreeRoomModalOpen] = useState(false);

  // Background sync fetcher from MongoDB Atlas
  const fetchRemoteRooms = useCallback(async () => {
    try {
      const [resA, resB] = await Promise.all([
        fetch('/api/rooms/manual?week=A').catch(() => null),
        fetch('/api/rooms/manual?week=B').catch(() => null),
      ]);

      if (resA && resA.ok) {
        const dataA = await resA.json();
        if (dataA.studyRooms && Array.isArray(dataA.studyRooms) && dataA.studyRooms.length > 0) {
          setManualRoomsA(prev => {
            const map = new Map<string, FreeStudyRoom>();
            prev.forEach(r => {
              const code = cleanRoomCode(r.roomCode);
              if (code) map.set(`${code}-${r.dayOfWeek}-${r.periodId}`, { ...r, roomCode: code, contributedBy: 'Anonymous Submission' });
            });
            dataA.studyRooms.forEach((r: FreeStudyRoom) => {
              const code = cleanRoomCode(r.roomCode);
              if (code) map.set(`${code}-${r.dayOfWeek}-${r.periodId}`, { ...r, roomCode: code, contributedBy: 'Anonymous Submission' });
            });
            return Array.from(map.values());
          });
        }
      }

      if (resB && resB.ok) {
        const dataB = await resB.json();
        if (dataB.studyRooms && Array.isArray(dataB.studyRooms) && dataB.studyRooms.length > 0) {
          setManualRoomsB(prev => {
            const map = new Map<string, FreeStudyRoom>();
            prev.forEach(r => {
              const code = cleanRoomCode(r.roomCode);
              if (code) map.set(`${code}-${r.dayOfWeek}-${r.periodId}`, { ...r, roomCode: code, contributedBy: 'Anonymous Submission' });
            });
            dataB.studyRooms.forEach((r: FreeStudyRoom) => {
              const code = cleanRoomCode(r.roomCode);
              if (code) map.set(`${code}-${r.dayOfWeek}-${r.periodId}`, { ...r, roomCode: code, contributedBy: 'Anonymous Submission' });
            });
            return Array.from(map.values());
          });
        }
      }

      setLastSyncedAt(new Date());
    } catch (err) {
      // Graceful fallback to client state
    }
  }, []);

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

  // All lessons for currently selected week
  const allLessons = selectedWeek === 'A'
    ? PARSED_WEEK_A.lessons
    : PARSED_WEEK_B.lessons;

  // Combine all study rooms from MongoDB Atlas + baseline Arbor study rooms
  const rawStudyRooms = selectedWeek === 'A'
    ? [...manualRoomsA, ...PARSED_WEEK_A.studyRooms]
    : [...manualRoomsB, ...PARSED_WEEK_B.studyRooms];

  // Deduplicate and clean room codes
  const dedupedMap = new Map<string, FreeStudyRoom>();
  rawStudyRooms.forEach(room => {
    const clean = cleanRoomCode(room.roomCode);
    if (clean) {
      const key = `${clean}-${room.dayOfWeek}-${room.periodId}`;
      dedupedMap.set(key, {
        ...room,
        roomCode: clean,
        contributedBy: 'Anonymous Submission'
      });
    }
  });

  // STRICT OVERLAP FILTER: Never display a room as free if a class is timetabled in that room in this period!
  const studyRooms = Array.from(dedupedMap.values()).filter(
    room => !isRoomOccupiedByClass(room.roomCode, room.dayOfWeek, room.periodId, allLessons)
  );

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
        name: 'Student',
        email: email.trim(),
        studentId: 10433,
        schoolUrl,
        loggedInAt: new Date().toISOString(),
      };

      setStudentSession(newSession);

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#00875f', '#005047', '#10b981'],
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

  // Add Manual Free Room with Instant UI update & Class Overlap validation
  const addManualFreeRoom = (roomCode: string, dayOfWeek: number, periodId: string, notes?: string) => {
    const cleanCode = cleanRoomCode(roomCode);
    if (!cleanCode) return { success: false, error: 'Room code is required.' };

    // Prevent adding room if there is a class overlap
    if (isRoomOccupiedByClass(cleanCode, dayOfWeek, periodId, allLessons)) {
      return {
        success: false,
        error: `Room ${cleanCode} is currently timetabled for a teaching class in this period.`
      };
    }

    const period = WRENN_PERIODS.find(p => p.id === periodId) || WRENN_PERIODS[0];
    const dayObj = DAYS_OF_WEEK.find(d => d.id === dayOfWeek) || DAYS_OF_WEEK[0];
    const roomId = `manual-${selectedWeek}-${Date.now()}-${cleanCode}`;

    const newFreeRoom: FreeStudyRoom = {
      id: roomId,
      roomCode: cleanCode,
      dayOfWeek,
      dayName: dayObj.name,
      periodId: period.id,
      periodNumber: period.number ?? 1,
      lessonSubject: 'Free Study Room',
      contributedBy: 'Anonymous Submission',
      isManual: true,
      notes,
    };

    // Instant local state update
    if (selectedWeek === 'A') {
      setManualRoomsA(prev => [newFreeRoom, ...prev.filter(r => r.id !== roomId)]);
    } else {
      setManualRoomsB(prev => [newFreeRoom, ...prev.filter(r => r.id !== roomId)]);
    }
    setIsAddFreeRoomModalOpen(false);

    // Save anonymously to MongoDB Atlas
    fetch('/api/rooms/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: roomId,
        roomCode: cleanCode,
        weekType: selectedWeek,
        dayOfWeek,
        periodId: period.id,
        notes,
        contributedBy: 'Anonymous Submission',
      }),
    }).catch(err => {
      console.warn('Backend sync failed, saved in client storage:', err);
    });

    return { success: true };
  };

  const deleteFreeRoom = (id: string) => {
    if (selectedWeek === 'A') {
      setManualRoomsA(prev => prev.filter(r => r.id !== id));
    } else {
      setManualRoomsB(prev => prev.filter(r => r.id !== id));
    }

    fetch(`/api/rooms/manual?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(() => {});
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
