import { Room, Period, Booking, RoomOverride, RoomStatus, StatusCategory, UserRoomAssignment } from '@/types';

// Convert "HH:MM" string to minutes from midnight
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Convert minutes from midnight to "HH:MM"
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Format duration into readable string e.g. "1h 20m" or "45m"
export function formatDuration(mins: number | null): string {
  if (mins === null || mins === undefined) return '';
  if (mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// Find the period matching a given time
export function getCurrentPeriod(timeStr: string, periods: Period[]): Period | null {
  const currentMins = timeStringToMinutes(timeStr);
  return (
    periods.find(p => {
      const start = timeStringToMinutes(p.startTime);
      const end = timeStringToMinutes(p.endTime);
      return currentMins >= start && currentMins < end;
    }) || null
  );
}

// Calculate availability for a specific room at a specific day/time
export function calculateRoomStatus({
  room,
  bookings,
  overrides,
  userAssignment,
  date,
  timeStr,
  dayOfWeek,
  endOfDayTime = '16:00'
}: {
  room: Room;
  bookings: Booking[];
  overrides: RoomOverride[];
  userAssignment?: UserRoomAssignment | null;
  date: string; // YYYY-MM-DD
  timeStr: string; // "HH:MM"
  dayOfWeek: number; // 0-6
  endOfDayTime?: string;
}): RoomStatus {
  const currentMins = timeStringToMinutes(timeStr);
  const endOfDayMins = timeStringToMinutes(endOfDayTime);

  // Filter bookings for this room on this day
  const roomBookings = bookings
    .filter(b => {
      if (b.roomId !== room.id) return false;
      if (b.date) {
        return b.date === date;
      }
      return b.dayOfWeek === dayOfWeek;
    })
    .sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime));

  // Find active override for this room right now
  const activeOverride = overrides.find(ov => {
    if (ov.roomId !== room.id || ov.date !== date) return false;
    const ovStart = timeStringToMinutes(ov.startTime);
    const ovEnd = timeStringToMinutes(ov.endTime);
    return currentMins >= ovStart && currentMins < ovEnd;
  }) || null;

  // Active scheduled booking
  const currentBooking = roomBookings.find(b => {
    const start = timeStringToMinutes(b.startTime);
    const end = timeStringToMinutes(b.endTime);
    return currentMins >= start && currentMins < end;
  }) || null;

  // Next upcoming booking
  const nextBooking = roomBookings.find(b => {
    const start = timeStringToMinutes(b.startTime);
    return start > currentMins;
  }) || null;

  const isAssignedToUser = 
    userAssignment?.actualRoomId === room.id || 
    (userAssignment?.assignedRoomId === room.id && !userAssignment.actualRoomId);

  // Determine status
  let status: StatusCategory = 'available';
  let isAvailable = true;
  let freeUntil: string | null = null;
  let freeDurationMinutes: number | null = null;
  let timeUntilFreeMinutes: number | null = null;

  if (activeOverride) {
    if (activeOverride.type === 'force_free' || activeOverride.type === 'assigned_to_me') {
      status = 'manual_free';
      isAvailable = true;
      freeUntil = activeOverride.endTime;
      freeDurationMinutes = Math.max(0, timeStringToMinutes(activeOverride.endTime) - currentMins);
    } else if (activeOverride.type === 'force_occupied') {
      status = 'manual_occupied';
      isAvailable = false;
      timeUntilFreeMinutes = Math.max(0, timeStringToMinutes(activeOverride.endTime) - currentMins);
    }
  } else if (currentBooking) {
    status = 'occupied';
    isAvailable = false;
    const currentBookingEndMins = timeStringToMinutes(currentBooking.endTime);
    timeUntilFreeMinutes = Math.max(0, currentBookingEndMins - currentMins);

    // If it's free soon (within 15 minutes)
    if (timeUntilFreeMinutes <= 15) {
      status = 'free_soon';
    }
  } else {
    // It is free!
    status = 'available';
    isAvailable = true;

    if (nextBooking) {
      const nextStartMins = timeStringToMinutes(nextBooking.startTime);
      freeUntil = nextBooking.startTime;
      freeDurationMinutes = Math.max(0, nextStartMins - currentMins);
    } else {
      freeUntil = endOfDayTime;
      freeDurationMinutes = Math.max(0, endOfDayMins - currentMins);
    }
  }

  return {
    room,
    status,
    isAvailable,
    currentBooking,
    nextBooking,
    freeUntil,
    freeDurationMinutes,
    timeUntilFreeMinutes,
    activeOverride,
    isAssignedToUser,
  };
}

// Find smart recommendations when user wants a free room (e.g., swapping out of 6B)
export function getRecommendedFreeRooms({
  assignedRoomId,
  allStatuses,
  minFreeMinutes = 30
}: {
  assignedRoomId?: string;
  allStatuses: RoomStatus[];
  minFreeMinutes?: number;
}): RoomStatus[] {
  const assigned = allStatuses.find(s => s.room.id === assignedRoomId);
  const targetBlock = assigned?.room.block;

  return allStatuses
    .filter(s => {
      // Must be currently available or manual free
      if (!s.isAvailable) return false;
      // Don't recommend the same room
      if (assignedRoomId && s.room.id === assignedRoomId) return false;
      // Staff only rooms should not be primary recommendation
      if (s.room.type === 'staff_only') return false;
      // Free for enough time
      if (s.freeDurationMinutes !== null && s.freeDurationMinutes < minFreeMinutes) return false;
      return true;
    })
    .sort((a, b) => {
      // Prefer same block
      if (targetBlock) {
        if (a.room.block === targetBlock && b.room.block !== targetBlock) return -1;
        if (b.room.block === targetBlock && a.room.block !== targetBlock) return 1;
      }
      // Prefer same floor
      if (assigned) {
        if (a.room.floor === assigned.room.floor && b.room.floor !== assigned.room.floor) return -1;
        if (b.room.floor === assigned.room.floor && a.room.floor !== assigned.room.floor) return 1;
      }
      // Prefer longer free duration
      const durA = a.freeDurationMinutes || 999;
      const durB = b.freeDurationMinutes || 999;
      return durB - durA;
    });
}
