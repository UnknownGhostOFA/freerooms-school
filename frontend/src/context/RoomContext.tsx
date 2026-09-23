'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Room, 
  Booking, 
  RoomOverride, 
  UserRoomAssignment, 
  RoomStatus, 
  Period,
  StatusCategory 
} from '@/types';
import { 
  INITIAL_ROOMS, 
  INITIAL_BOOKINGS, 
  DEFAULT_PERIODS, 
  SCHOOL_CONFIG 
} from '@/lib/schoolData';
import { 
  calculateRoomStatus, 
  getCurrentPeriod, 
  getRecommendedFreeRooms,
  minutesToTimeString,
  timeStringToMinutes 
} from '@/lib/timetableEngine';
import confetti from 'canvas-confetti';

interface RoomContextType {
  // Data
  rooms: Room[];
  bookings: Booking[];
  overrides: RoomOverride[];
  userAssignment: UserRoomAssignment | null;
  periods: Period[];
  
  // Time & Simulation
  simulatedDate: string; // YYYY-MM-DD
  simulatedTime: string; // HH:MM
  isLiveTime: boolean;
  activePeriod: Period | null;
  currentDayOfWeek: number;
  
  // Controls for Time
  setSimulatedDate: (d: string) => void;
  setSimulatedTime: (t: string) => void;
  setIsLiveTime: (live: boolean) => void;
  jumpToPeriod: (periodId: string) => void;
  resetToLiveNow: () => void;
  
  // Calculations
  roomStatuses: RoomStatus[];
  freeRoomsCount: number;
  occupiedRoomsCount: number;
  freeSoonRoomsCount: number;
  recommendedFreeRooms: RoomStatus[];
  
  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedBlock: string;
  setSelectedBlock: (b: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  statusFilter: 'all' | 'free_now' | 'free_1hr' | 'occupied' | 'my_rooms';
  setStatusFilter: (f: 'all' | 'free_now' | 'free_1hr' | 'occupied' | 'my_rooms') => void;
  selectedFeatures: string[];
  toggleFeatureFilter: (feat: string) => void;
  
  // Actions
  addRoom: (newRoom: Omit<Room, 'id'>) => Room;
  editRoom: (id: string, updated: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  
  addBooking: (booking: Omit<Booking, 'id'>) => Booking;
  deleteBooking: (id: string) => void;
  
  setRoomOverride: (roomId: string, type: 'force_free' | 'force_occupied' | 'assigned_to_me', notes?: string) => void;
  clearRoomOverride: (roomId: string) => void;
  
  setUserAssignment: (assignment: { assignedRoomId: string; actualRoomId?: string; reason?: string }) => void;
  quickSwapRoom: (toRoomId: string, reason?: string) => void;
  clearUserAssignment: () => void;
  
  importBookings: (importedBookings: Booking[], newRooms?: Room[]) => void;
  resetAllData: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROOMS: 'freerooms_rooms_v1',
  BOOKINGS: 'freerooms_bookings_v1',
  OVERRIDES: 'freerooms_overrides_v1',
  ASSIGNMENT: 'freerooms_user_assignment_v1',
};

export function RoomProvider({ children }: { children: ReactNode }) {
  // Initialize state
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [overrides, setOverrides] = useState<RoomOverride[]>([]);
  const [userAssignment, setUserAssignmentState] = useState<UserRoomAssignment | null>(null);

  // Time & Simulation
  const [isLiveTime, setIsLiveTime] = useState<boolean>(false); // default to simulated school hours (10:15 / Period 2)
  const [simulatedDate, setSimulatedDate] = useState<string>(() => {
    const today = new Date();
    // If weekend, default to Monday
    if (today.getDay() === 0 || today.getDay() === 6) {
      return '2026-09-21'; // Monday
    }
    return today.toISOString().split('T')[0];
  });
  
  // Default to 10:15 (Period 2) for immediate rich view
  const [simulatedTime, setSimulatedTime] = useState<string>('10:15');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'free_now' | 'free_1hr' | 'occupied' | 'my_rooms'>('all');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Load from LocalStorage or auto-load Wrenn School live data
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
      const savedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      const savedOverrides = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
      const savedAssignment = localStorage.getItem(STORAGE_KEYS.ASSIGNMENT);

      if (savedRooms && JSON.parse(savedRooms).length > 0) {
        setRooms(JSON.parse(savedRooms));
        if (savedBookings) setBookings(JSON.parse(savedBookings));
        if (savedOverrides) setOverrides(JSON.parse(savedOverrides));
        if (savedAssignment) setUserAssignmentState(JSON.parse(savedAssignment));
      } else {
        // Auto-load Wrenn School timetable
        fetch('/api/arbor/local-sync')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.rooms) {
              setRooms(data.rooms);
              setBookings(data.bookings || []);
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error('Error loading stored room data:', e);
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch {}
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch {}
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
    } catch {}
  }, [overrides]);

  useEffect(() => {
    try {
      if (userAssignment) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENT, JSON.stringify(userAssignment));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ASSIGNMENT);
      }
    } catch {}
  }, [userAssignment]);

  // Live clock ticker when isLiveTime is enabled
  useEffect(() => {
    if (!isLiveTime) return;

    const updateLiveTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setSimulatedTime(`${h}:${m}`);
      setSimulatedDate(now.toISOString().split('T')[0]);
    };

    updateLiveTime();
    const interval = setInterval(updateLiveTime, 30000); // every 30s
    return () => clearInterval(interval);
  }, [isLiveTime]);

  // Derive current day of week
  const currentDayOfWeek = useMemo(() => {
    const d = new Date(simulatedDate + 'T12:00:00');
    return d.getDay();
  }, [simulatedDate]);

  // Active Period
  const activePeriod = useMemo(() => {
    return getCurrentPeriod(simulatedTime, DEFAULT_PERIODS);
  }, [simulatedTime]);

  // Jump to specific Period
  const jumpToPeriod = (periodId: string) => {
    const p = DEFAULT_PERIODS.find(item => item.id === periodId);
    if (p) {
      setIsLiveTime(false);
      // set time to 5 minutes into the period
      const startMins = timeStringToMinutes(p.startTime) + 5;
      setSimulatedTime(minutesToTimeString(startMins));
    }
  };

  const resetToLiveNow = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setSimulatedTime(`${h}:${m}`);
    setSimulatedDate(now.toISOString().split('T')[0]);
    setIsLiveTime(true);
  };

  // Calculate statuses for all rooms
  const roomStatuses = useMemo(() => {
    return rooms.map(room => {
      return calculateRoomStatus({
        room,
        bookings,
        overrides,
        userAssignment,
        date: simulatedDate,
        timeStr: simulatedTime,
        dayOfWeek: currentDayOfWeek,
      });
    });
  }, [rooms, bookings, overrides, userAssignment, simulatedDate, simulatedTime, currentDayOfWeek]);

  // High-level counts
  const freeRoomsCount = useMemo(() => {
    return roomStatuses.filter(s => s.isAvailable).length;
  }, [roomStatuses]);

  const occupiedRoomsCount = useMemo(() => {
    return roomStatuses.filter(s => !s.isAvailable && s.status !== 'free_soon').length;
  }, [roomStatuses]);

  const freeSoonRoomsCount = useMemo(() => {
    return roomStatuses.filter(s => s.status === 'free_soon').length;
  }, [roomStatuses]);

  // Recommended free rooms for quick swap
  const recommendedFreeRooms = useMemo(() => {
    return getRecommendedFreeRooms({
      assignedRoomId: userAssignment?.assignedRoomId,
      allStatuses: roomStatuses,
      minFreeMinutes: 30
    });
  }, [userAssignment, roomStatuses]);

  // Filter actions
  const toggleFeatureFilter = (feat: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  // Room CRUD
  const addRoom = (newRoomData: Omit<Room, 'id'>): Room => {
    const id = `room-${newRoomData.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const created: Room = {
      ...newRoomData,
      id,
      isCustom: true
    };
    setRooms(prev => [created, ...prev]);
    return created;
  };

  const editRoom = (id: string, updated: Partial<Room>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const deleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    setBookings(prev => prev.filter(b => b.roomId !== id));
    setOverrides(prev => prev.filter(ov => ov.roomId !== id));
    if (userAssignment?.assignedRoomId === id || userAssignment?.actualRoomId === id) {
      setUserAssignmentState(null);
    }
  };

  // Booking CRUD
  const addBooking = (bookingData: Omit<Booking, 'id'>): Booking => {
    const id = `booking-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const created: Booking = {
      ...bookingData,
      id
    };
    setBookings(prev => [...prev, created]);
    return created;
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // Room Overrides
  const setRoomOverride = (
    roomId: string, 
    type: 'force_free' | 'force_occupied' | 'assigned_to_me', 
    notes?: string
  ) => {
    const currentMins = timeStringToMinutes(simulatedTime);
    // default override lasts until end of current period or 2 hours
    const endTime = minutesToTimeString(Math.min(16 * 60, currentMins + 120));

    const newOverride: RoomOverride = {
      id: `ov-${roomId}-${Date.now()}`,
      roomId,
      type,
      date: simulatedDate,
      startTime: simulatedTime,
      endTime: endTime,
      notes,
      createdAt: new Date().toISOString()
    };

    setOverrides(prev => [
      ...prev.filter(ov => !(ov.roomId === roomId && ov.date === simulatedDate)),
      newOverride
    ]);
  };

  const clearRoomOverride = (roomId: string) => {
    setOverrides(prev => prev.filter(ov => !(ov.roomId === roomId && ov.date === simulatedDate)));
  };

  // User Assignment & Quick Swap
  const setUserAssignment = (assignment: { assignedRoomId: string; actualRoomId?: string; reason?: string }) => {
    setUserAssignmentState({
      assignedRoomId: assignment.assignedRoomId,
      actualRoomId: assignment.actualRoomId,
      reason: assignment.reason,
      timestamp: new Date().toISOString()
    });
  };

  const quickSwapRoom = (toRoomId: string, reason = 'Swapped to free room') => {
    const currentAssigned = userAssignment?.assignedRoomId || 'room-6b';
    setUserAssignmentState({
      assignedRoomId: currentAssigned,
      actualRoomId: toRoomId,
      reason,
      timestamp: new Date().toISOString()
    });

    // Mark that room with an active override or assignment
    setRoomOverride(toRoomId, 'assigned_to_me', `Self-assigned study room (swapped from ${rooms.find(r => r.id === currentAssigned)?.code || currentAssigned})`);

    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#6366f1']
      });
    } catch {}
  };

  const clearUserAssignment = () => {
    setUserAssignmentState(null);
  };

  // Import
  const importBookings = (importedBookings: Booking[], newRooms?: Room[]) => {
    if (newRooms && newRooms.length > 0) {
      setRooms(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const toAdd = newRooms.filter(r => !existingIds.has(r.id));
        return [...prev, ...toAdd];
      });
    }
    setBookings(prev => [...prev, ...importedBookings]);
  };

  const resetAllData = () => {
    setRooms([]);
    setBookings([]);
    setOverrides([]);
    setUserAssignmentState(null);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNMENT);
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        bookings,
        overrides,
        userAssignment,
        periods: DEFAULT_PERIODS,
        simulatedDate,
        simulatedTime,
        isLiveTime,
        activePeriod,
        currentDayOfWeek,
        setSimulatedDate,
        setSimulatedTime,
        setIsLiveTime,
        jumpToPeriod,
        resetToLiveNow,
        roomStatuses,
        freeRoomsCount,
        occupiedRoomsCount,
        freeSoonRoomsCount,
        recommendedFreeRooms,
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
        addRoom,
        editRoom,
        deleteRoom,
        addBooking,
        deleteBooking,
        setRoomOverride,
        clearRoomOverride,
        setUserAssignment,
        quickSwapRoom,
        clearUserAssignment,
        importBookings,
        resetAllData,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
}
