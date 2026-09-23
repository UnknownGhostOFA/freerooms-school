import { Room, Period, Booking, SchoolConfig } from '@/types';

// Wrenn School standard period timings
export const DEFAULT_PERIODS: Period[] = [
  { id: 'reg', name: 'Registration / Form Time', shortName: 'Reg', startTime: '08:40', endTime: '09:10', isBreak: false },
  { id: 'p1', name: 'Period 1', shortName: 'P1', startTime: '09:10', endTime: '10:10', isBreak: false },
  { id: 'break', name: 'Morning Break', shortName: 'Break', startTime: '10:10', endTime: '10:30', isBreak: true },
  { id: 'p2', name: 'Period 2', shortName: 'P2', startTime: '10:30', endTime: '11:30', isBreak: false },
  { id: 'p3', name: 'Period 3', shortName: 'P3', startTime: '11:30', endTime: '12:30', isBreak: false },
  { id: 'p4', name: 'Period 4', shortName: 'P4', startTime: '12:30', endTime: '13:30', isBreak: false },
  { id: 'lunch', name: 'Lunch Break', shortName: 'Lunch', startTime: '13:30', endTime: '14:10', isBreak: true },
  { id: 'p5', name: 'Period 5', shortName: 'P5', startTime: '14:10', endTime: '15:10', isBreak: false },
  { id: 'after', name: 'After School Study', shortName: 'After', startTime: '15:10', endTime: '16:00', isBreak: false },
];

export const DEFAULT_BLOCKS: string[] = [
  'Sixth Form Centre',
  'Main Block',
  'Computing Suite',
  'Science Wing',
  'Creative Arts',
];

// Clean live data starting state
export const INITIAL_ROOMS: Room[] = [];
export const INITIAL_BOOKINGS: Booking[] = [];

export const SCHOOL_CONFIG: SchoolConfig = {
  name: 'Wrenn School & Sixth Form',
  periods: DEFAULT_PERIODS,
  blocks: DEFAULT_BLOCKS,
};
