'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Period, FreeStudyRoom, ClassLesson } from '@/types';
import {
  WRENN_PERIODS,
  DAYS_OF_WEEK,
  PARSED_WEEK_A,
  PARSED_WEEK_B,
  cleanRoomCode
} from '@/lib/crowdsourceEngine';
import confetti from 'canvas-confetti';

export interface ArborStudentSession {
  name: string;
  email: string;
  studentId?: number;
  schoolUrl: string;
  loggedInAt: string;
  claimedRoom?: {
    roomCode: string;
    periodId: string;
    dayOfWeek: number;
  };
}

interface ArborMatrixContextType {
  periods: Period[];
  days: typeof DAYS_OF_WEEK;
  selectedDay: number; // 1=Mon .. 5=Fri
  setSelectedDay: (d: number) => void;
  selectedWeek: 'A' | 'B';
  setSelectedWeek: (w: 'A' | 'B') => void;

  // Study Rooms & Classes Data for currently selected week
  studyRooms: FreeStudyRoom[];
  allLessons: ClassLesson[];

  // Direct Arbor Student Session
  studentSession: ArborStudentSession | null;
  arborLogin: (schoolUrl: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logoutStudent: () => void;

  // Manual Free Room submission
  addManualFreeRoom: (roomCode: string, dayOfWeek: number, periodId: string, notes?: string) => void;
  deleteFreeRoom: (id: string) => void;

  // Claim / "I am in this room"
  claimStudyRoom: (roomCode: string, periodId: string, dayOfWeek: number) => void;
  clearClaimedRoom: () => void;

  // Modal states
  activePeriodDetails: { period: Period; day: number } | null;
  setActivePeriodDetails: (details: { period: Period; day: number } | null) => void;
  isAddFreeRoomModalOpen: boolean;
  setIsAddFreeRoomModalOpen: (open: boolean) => void;
}

const ArborMatrixContext = createContext<ArborMatrixContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSION: 'arbor_student_session_v4',
  MANUAL_ROOMS_A: 'arbor_manual_rooms_a_v4',
  MANUAL_ROOMS_B: 'arbor_manual_rooms_b_v4',
  SELECTED_WEEK: 'arbor_selected_week_v4',
};

export function ArborMatrixProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) return today;
    return 1;
  });

  const [selectedWeek, setSelectedWeek] = useState<'A' | 'B'>('A');
  const [manualRoomsA, setManualRoomsA] = useState<FreeStudyRoom[]>([]);
  const [manualRoomsB, setManualRoomsB] = useState<FreeStudyRoom[]>([]);
  const [studentSession, setStudentSession] = useState<ArborStudentSession | null>(null);

  const [activePeriodDetails, setActivePeriodDetails] = useState<{ period: Period; day: number } | null>(null);
  const [isAddFreeRoomModalOpen, setIsAddFreeRoomModalOpen] = useState(false);

  // 1. Initial load from localStorage + background fetch from database
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (savedSession) setStudentSession(JSON.parse(savedSession));

      const savedWeek = localStorage.getItem(STORAGE_KEYS.SELECTED_WEEK);
      if (savedWeek === 'A' || savedWeek === 'B') setSelectedWeek(savedWeek);

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

    // Background sync from MongoDB / Server backend
    const fetchRemoteRooms = async () => {
      try {
        const [resA, resB] = await Promise.all([
          fetch('/api/rooms/manual?week=A').catch(() => null),
          fetch('/api/rooms/manual?week=B').catch(() => null),
        ]);

        if (resA && resA.ok) {
          const dataA = await resA.json();
          if (dataA.studyRooms && Array.isArray(dataA.studyRooms)) {
            const manualOnly = dataA.studyRooms.filter((r: FreeStudyRoom) => r.isManual);
            if (manualOnly.length > 0) {
              setManualRoomsA(prev => {
                const map = new Map<string, FreeStudyRoom>();
                prev.forEach(r => map.set(r.id || `${r.roomCode}-${r.periodId}-${r.dayOfWeek}`, r));
                manualOnly.forEach((r: FreeStudyRoom) => map.set(r.id || `${r.roomCode}-${r.periodId}-${r.dayOfWeek}`, r));
                return Array.from(map.values());
              });
            }
          }
        }

        if (resB && resB.ok) {
          const dataB = await resB.json();
          if (dataB.studyRooms && Array.isArray(dataB.studyRooms)) {
            const manualOnly = dataB.studyRooms.filter((r: FreeStudyRoom) => r.isManual);
            if (manualOnly.length > 0) {
              setManualRoomsB(prev => {
                const map = new Map<string, FreeStudyRoom>();
                prev.forEach(r => map.set(r.id || `${r.roomCode}-${r.periodId}-${r.dayOfWeek}`, r));
                manualOnly.forEach((r: FreeStudyRoom) => map.set(r.id || `${r.roomCode}-${r.periodId}-${r.dayOfWeek}`, r));
                return Array.from(map.values());
              });
            }
          }
        }
      } catch (err) {
        // Fallback gracefully to local storage
      }
    };

    fetchRemoteRooms();
  }, []);

  // 2. Persist to localStorage only AFTER hydration has occurred
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

  // Combine live Arbor study rooms + manual rooms for current week (manual rooms at top)
  const studyRooms = selectedWeek === 'A'
    ? [...manualRoomsA, ...PARSED_WEEK_A.studyRooms]
    : [...manualRoomsB, ...PARSED_WEEK_B.studyRooms];

  const allLessons = selectedWeek === 'A'
    ? PARSED_WEEK_A.lessons
    : PARSED_WEEK_B.lessons;

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

      // Name extraction
      const studentName = email.split('@')[0].toUpperCase();
      const displayName = studentName || 'Student';

      const newSession: ArborStudentSession = {
        name: displayName,
        email: email.trim(),
        studentId: 10433,
        schoolUrl,
        loggedInAt: new Date().toISOString(),
      };

      setStudentSession(newSession);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00875f', '#005047', '#10b981'],
        });
      } catch {}

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

  // Claim Room
  const claimStudyRoom = (roomCode: string, periodId: string, dayOfWeek: number) => {
    if (studentSession) {
      setStudentSession({
        ...studentSession,
        claimedRoom: { roomCode, periodId, dayOfWeek },
      });
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#00875f', '#005047', '#10b981'],
      });
    } catch {}
  };

  const clearClaimedRoom = () => {
    if (studentSession) {
      setStudentSession({
        ...studentSession,
        claimedRoom: undefined,
      });
    }
  };

  // Add Manual Free Room
  const addManualFreeRoom = (roomCode: string, dayOfWeek: number, periodId: string, notes?: string) => {
    const cleanCode = cleanRoomCode(roomCode);
    const period = WRENN_PERIODS.find(p => p.id === periodId) || WRENN_PERIODS[1];
    const dayObj = DAYS_OF_WEEK.find(d => d.id === dayOfWeek) || DAYS_OF_WEEK[0];
    const roomId = `manual-${selectedWeek}-${Date.now()}-${cleanCode}`;

    const newFreeRoom: FreeStudyRoom = {
      id: roomId,
      roomCode: cleanCode,
      dayOfWeek,
      dayName: dayObj.name,
      periodId: period.id,
      periodNumber: period.number ?? 0,
      lessonSubject: 'Free Study Room (Reported by Student)',
      contributedBy: studentSession ? studentSession.name : 'Student Submission',
      isManual: true,
      notes,
    };

    if (selectedWeek === 'A') {
      setManualRoomsA(prev => [newFreeRoom, ...prev.filter(r => r.id !== roomId)]);
    } else {
      setManualRoomsB(prev => [newFreeRoom, ...prev.filter(r => r.id !== roomId)]);
    }
    setIsAddFreeRoomModalOpen(false);

    // Save asynchronously to backend / MongoDB Atlas
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
        contributedBy: studentSession ? studentSession.name : 'Student Submission',
      }),
    }).catch(err => {
      console.warn('Backend sync failed, saved in client storage:', err);
    });
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
        periods: WRENN_PERIODS,
        days: DAYS_OF_WEEK,
        selectedDay,
        setSelectedDay,
        selectedWeek,
        setSelectedWeek,
        studyRooms,
        allLessons,
        studentSession,
        arborLogin,
        logoutStudent,
        addManualFreeRoom,
        deleteFreeRoom,
        claimStudyRoom,
        clearClaimedRoom,
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
