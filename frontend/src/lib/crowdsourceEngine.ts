import { Period, FreeStudyRoom, ClassLesson } from '@/types';
import liveWeeksData from '../../arbor-live-weeks.json';

export const WRENN_PERIODS: Period[] = [
  { id: 'p1', number: 1, name: 'Period 1', shortName: 'P1', startTime: '09:10', endTime: '10:10' },
  { id: 'p2', number: 2, name: 'Period 2', shortName: 'P2', startTime: '10:10', endTime: '11:10' },
  { id: 'p3', number: 3, name: 'Period 3', shortName: 'P3', startTime: '11:30', endTime: '12:30' },
  { id: 'p4', number: 4, name: 'Period 4', shortName: 'P4', startTime: '12:30', endTime: '13:30' },
  { id: 'p5', number: 5, name: 'Period 5', shortName: 'P5', startTime: '14:10', endTime: '15:10' },
];

export const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
];

export function matchTimeToPeriod(timeStr: string): Period | null {
  if (!timeStr) return WRENN_PERIODS[0];
  const parts = timeStr.split(':');
  const mins = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);

  if (mins < 9 * 60 + 10) return null; // Form Time (08:40 - 09:10) -> Excluded
  if (mins < 10 * 60 + 10) return WRENN_PERIODS[0]; // P1 (09:10 - 10:10)
  if (mins < 11 * 60 + 20) return WRENN_PERIODS[1]; // P2 (10:10 - 11:10)
  if (mins < 12 * 60 + 30) return WRENN_PERIODS[2]; // P3 (11:30 - 12:30)
  if (mins < 13 * 60 + 50) return WRENN_PERIODS[3]; // P4 (12:30 - 13:30)
  return WRENN_PERIODS[4]; // P5 (14:10 - 15:10)
}

export function cleanRoomCode(raw: string): string {
  if (!raw) return '';
  let clean = String(raw).trim();
  clean = clean.replace(/^.*?:\s*/i, '');
  clean = clean.replace(/^room[\s\-_]*/i, '');
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
  return clean.toUpperCase();
}

export function isStudyLesson(subject: string): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase();
  return (
    s.includes('study') ||
    s.includes('6th form study') ||
    s.includes('st2') ||
    s.includes('st1') ||
    s.includes('free') ||
    s.includes('private study')
  );
}

/**
 * Checks if a room has a teaching class overlap in a given period and day.
 * Returns true if a teaching class (non-study lesson) is occupying the room.
 */
export function isRoomOccupiedByClass(
  roomCode: string,
  dayOfWeek: number,
  periodId: string,
  allLessons: ClassLesson[]
): boolean {
  const clean = cleanRoomCode(roomCode);
  if (!clean) return false;
  return allLessons.some(
    lesson =>
      lesson.dayOfWeek === dayOfWeek &&
      lesson.periodId === periodId &&
      cleanRoomCode(lesson.roomCode) === clean &&
      !lesson.isStudy
  );
}

// Process Week A and Week B raw lessons with exact day mapping based on Form time (08:40)
function processRawWeek(rawEvents: any[], weekType: 'A' | 'B'): { studyRooms: FreeStudyRoom[]; lessons: ClassLesson[] } {
  const studyRooms: FreeStudyRoom[] = [];
  const lessons: ClassLesson[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  let currentDayIdx = -1;

  rawEvents.forEach((ev, idx) => {
    // Each day starts at 08:40 (Form time)
    if (ev.start === '08:40') {
      currentDayIdx++;
    }
    const dayIdx = Math.max(0, Math.min(4, currentDayIdx));
    const dayOfWeek = dayIdx + 1; // 1=Mon .. 5=Fri
    const dayName = dayNames[dayIdx];

    const period = matchTimeToPeriod(ev.start);
    if (!period) return; // Exclude Form time

    const roomCode = cleanRoomCode(ev.room);
    const isStudy = isStudyLesson(ev.subject);

    if (roomCode) {
      lessons.push({
        id: `lesson-${weekType}-${idx}-${ev.eventId || idx}`,
        roomCode,
        subject: ev.subject,
        teacher: ev.teacher || undefined,
        dayOfWeek,
        periodId: period.id,
        startTime: ev.start,
        endTime: ev.end,
        isStudy,
        contributedBy: 'Arbor Timetable',
      });

      if (isStudy) {
        studyRooms.push({
          id: `study-${weekType}-${dayOfWeek}-${period.id}-${roomCode}-${idx}`,
          roomCode,
          dayOfWeek,
          dayName,
          periodId: period.id,
          periodNumber: period.number ?? 1,
          lessonSubject: ev.subject,
          supervisor: ev.teacher || 'Study Supervisor',
          contributedBy: `Arbor (Week ${weekType})`,
          isManual: false,
        });
      }
    }
  });

  return { studyRooms, lessons };
}

// Live parsed Week A and Week B datasets directly from Wrenn School Arbor API
export const PARSED_WEEK_A = processRawWeek((liveWeeksData as any).weekA || [], 'A');
export const PARSED_WEEK_B = processRawWeek((liveWeeksData as any).weekB || [], 'B');
