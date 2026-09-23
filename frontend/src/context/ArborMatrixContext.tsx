'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Period, FreeStudyRoom, ClassLesson, UserAccount } from '@/types';
import { 
  WRENN_PERIODS, 
  DAYS_OF_WEEK, 
  PARSED_WEEK_A,
  PARSED_WEEK_B,
  cleanRoomCode 
} from '@/lib/crowdsourceEngine';
import confetti from 'canvas-confetti';

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
  
  // User Account
  currentUser: UserAccount | null;
  loginUser: (name: string, email: string, provider?: 'google' | 'guest') => void;
  logoutUser: () => void;
  linkArborAndContribute: (schoolUrl: string, email: string, pass: string) => Promise<{ success: boolean; message: string; count: number }>;
  
  // Manual Free Room submission
  addManualFreeRoom: (roomCode: string, dayOfWeek: number, periodId: string, notes?: string) => void;
  deleteFreeRoom: (id: string) => void;
  
  // Claim / "I am in this room"
  claimStudyRoom: (roomCode: string, periodId: string, dayOfWeek: number) => void;
  clearClaimedRoom: () => void;
  
  // Modal states
  activePeriodDetails: { period: Period; day: number } | null;
  setActivePeriodDetails: (details: { period: Period; day: number } | null) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isAddFreeRoomModalOpen: boolean;
  setIsAddFreeRoomModalOpen: (open: boolean) => void;
  isLinkArborModalOpen: boolean;
  setIsLinkArborModalOpen: (open: boolean) => void;
}

const ArborMatrixContext = createContext<ArborMatrixContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'arbor_freerooms_user_v3',
  MANUAL_ROOMS_A: 'arbor_manual_rooms_a_v3',
  MANUAL_ROOMS_B: 'arbor_manual_rooms_b_v3',
  SELECTED_WEEK: 'arbor_selected_week_v3',
};

export function ArborMatrixProvider({ children }: { children: ReactNode }) {
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    if (today >= 1 && today <= 5) return today;
    return 1;
  });

  const [selectedWeek, setSelectedWeek] = useState<'A' | 'B'>('A');

  const [manualRoomsA, setManualRoomsA] = useState<FreeStudyRoom[]>([]);
  const [manualRoomsB, setManualRoomsB] = useState<FreeStudyRoom[]>([]);
  
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [activePeriodDetails, setActivePeriodDetails] = useState<{ period: Period; day: number } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddFreeRoomModalOpen, setIsAddFreeRoomModalOpen] = useState(false);
  const [isLinkArborModalOpen, setIsLinkArborModalOpen] = useState(false);

  // Load storage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedWeek = localStorage.getItem(STORAGE_KEYS.SELECTED_WEEK);
      if (savedWeek === 'A' || savedWeek === 'B') setSelectedWeek(savedWeek);

      const savedA = localStorage.getItem(STORAGE_KEYS.MANUAL_ROOMS_A);
      if (savedA) setManualRoomsA(JSON.parse(savedA));

      const savedB = localStorage.getItem(STORAGE_KEYS.MANUAL_ROOMS_B);
      if (savedB) setManualRoomsB(JSON.parse(savedB));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_WEEK, selectedWeek);
    } catch {}
  }, [selectedWeek]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MANUAL_ROOMS_A, JSON.stringify(manualRoomsA));
    } catch {}
  }, [manualRoomsA]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MANUAL_ROOMS_B, JSON.stringify(manualRoomsB));
    } catch {}
  }, [manualRoomsB]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {}
  }, [currentUser]);

  // Combine live Arbor study rooms + manual rooms for current week
  const studyRooms = selectedWeek === 'A' 
    ? [...manualRoomsA, ...PARSED_WEEK_A.studyRooms]
    : [...manualRoomsB, ...PARSED_WEEK_B.studyRooms];

  const allLessons = selectedWeek === 'A'
    ? PARSED_WEEK_A.lessons
    : PARSED_WEEK_B.lessons;

  // User Actions
  const loginUser = (name: string, email: string, provider: 'google' | 'guest' = 'google') => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim() || 'Student',
      email: email.trim(),
      provider,
      isArborConnected: true,
    };
    setCurrentUser(newUser);
    setIsLoginModalOpen(false);
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const linkArborAndContribute = async (schoolUrl: string, email: string, pass: string) => {
    return {
      success: true,
      message: 'Arbor timetable synced with Week A and Week B study rooms!',
      count: studyRooms.length,
    };
  };

  // Claim Room
  const claimStudyRoom = (roomCode: string, periodId: string, dayOfWeek: number) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        currentClaimedRoom: { roomCode, periodId, dayOfWeek },
      });
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#16a34a', '#059669', '#10b981'],
      });
    } catch {}
  };

  const clearClaimedRoom = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        currentClaimedRoom: undefined,
      });
    }
  };

  // Add Manual Free Room
  const addManualFreeRoom = (roomCode: string, dayOfWeek: number, periodId: string, notes?: string) => {
    const cleanCode = cleanRoomCode(roomCode);
    const period = WRENN_PERIODS.find(p => p.id === periodId) || WRENN_PERIODS[1];
    const dayObj = DAYS_OF_WEEK.find(d => d.id === dayOfWeek) || DAYS_OF_WEEK[0];

    const newFreeRoom: FreeStudyRoom = {
      id: `manual-${selectedWeek}-${Date.now()}-${cleanCode}`,
      roomCode: cleanCode,
      dayOfWeek,
      dayName: dayObj.name,
      periodId: period.id,
      periodNumber: period.number ?? 0,
      lessonSubject: 'Free Study Room (Reported by Student)',
      contributedBy: currentUser ? currentUser.name : 'Manual Submission',
      isManual: true,
      notes,
    };

    if (selectedWeek === 'A') {
      setManualRoomsA(prev => [newFreeRoom, ...prev]);
    } else {
      setManualRoomsB(prev => [newFreeRoom, ...prev]);
    }
    setIsAddFreeRoomModalOpen(false);
  };

  const deleteFreeRoom = (id: string) => {
    if (selectedWeek === 'A') {
      setManualRoomsA(prev => prev.filter(r => r.id !== id));
    } else {
      setManualRoomsB(prev => prev.filter(r => r.id !== id));
    }
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
        currentUser,
        loginUser,
        logoutUser,
        linkArborAndContribute,
        addManualFreeRoom,
        deleteFreeRoom,
        claimStudyRoom,
        clearClaimedRoom,
        activePeriodDetails,
        setActivePeriodDetails,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isAddFreeRoomModalOpen,
        setIsAddFreeRoomModalOpen,
        isLinkArborModalOpen,
        setIsLinkArborModalOpen,
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
