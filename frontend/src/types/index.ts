export interface Period {
  id: string;        // 'reg' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
  number?: number;   // 0 (Reg), 1, 2, 3, 4, 5
  name: string;      // "Period 1", "Period 2", etc.
  shortName: string; // "P1", "P2", etc.
  startTime: string; // "09:10"
  endTime: string;   // "10:10"
  isBreak?: boolean;
}

export interface FreeStudyRoom {
  id: string;
  roomCode: string;       // e.g. "6D", "6E", "6F", "7", "22", "6B"
  dayOfWeek: number;      // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  dayName: string;        // "Monday", "Tuesday", etc.
  periodId: string;       // 'p1', 'p2', 'p3', 'p4', 'p5'
  periodNumber: number;   // 1, 2, 3, 4, 5
  lessonSubject: string;  // e.g. "6th form study: Year 13: 13D/St2"
  supervisor?: string;    // e.g. "Supply", "Staff"
  contributedBy: string;  // e.g. "Student", "Manual"
  isManual?: boolean;
  notes?: string;
}

export interface ClassLesson {
  id: string;
  roomCode: string;
  subject: string;
  teacher?: string;
  dayOfWeek: number;
  periodId: string;
  startTime: string;
  endTime: string;
  isStudy: boolean;
  contributedBy: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'guest';
  isArborConnected: boolean;
  arborEmail?: string;
  currentClaimedRoom?: {
    roomCode: string;
    periodId: string;
    dayOfWeek: number;
  };
}

export interface ContributedTimetable {
  studentName: string;
  studentEmail: string;
  importedAt: string;
  studyRooms: FreeStudyRoom[];
  allLessons: ClassLesson[];
}

// Backwards compatibility types
export type RoomType = 'classroom' | 'study_room' | 'computer_lab' | 'science_lab' | 'art_studio' | 'hall' | 'staff_only' | 'music_practice';

export interface Room {
  id: string;
  name: string;
  code: string;
  block: string;
  floor?: string;
  capacity: number;
  type: RoomType;
  features: string[];
  isCustom?: boolean;
  notes?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  subject: string;
  teacher?: string;
  classGroup?: string;
  dayOfWeek: number;
  date?: string;
  startTime: string;
  endTime: string;
  periodId?: string;
  source: 'arbor' | 'teams' | 'manual' | 'preset';
  notes?: string;
}

export interface RoomOverride {
  id: string;
  roomId: string;
  type: 'force_free' | 'force_occupied' | 'assigned_to_me';
  customLabel?: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
}

export type StatusCategory = 'available' | 'occupied' | 'free_soon' | 'manual_free' | 'manual_occupied';

export interface RoomStatus {
  room: Room;
  status: StatusCategory;
  isAvailable: boolean;
  currentBooking: Booking | null;
  nextBooking: Booking | null;
  freeUntil: string | null;
  freeDurationMinutes: number | null;
  timeUntilFreeMinutes: number | null;
  activeOverride: RoomOverride | null;
  isAssignedToUser: boolean;
}

export interface UserRoomAssignment {
  assignedRoomId: string;
  actualRoomId?: string;
  reason?: string;
  timestamp: string;
}

export interface SchoolConfig {
  name: string;
  periods: Period[];
  blocks: string[];
}
