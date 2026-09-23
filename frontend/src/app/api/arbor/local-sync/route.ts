import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Booking, Room } from '@/types';

export async function GET() {
  try {
    const localFilePath = path.join(process.cwd(), 'arbor-live-weeks.json');
    if (!fs.existsSync(localFilePath)) {
      return NextResponse.json({ error: 'Local timetable file not found' }, { status: 404 });
    }

    const content = fs.readFileSync(localFilePath, 'utf-8');
    const data = JSON.parse(content);
    const entries = [...(data.weekA || []), ...(data.weekB || [])];

    const discoveredRoomsMap = new Map<string, Room>();
    const discoveredBookings: Booking[] = [];

    entries.forEach((e: any, idx: number) => {
      const rawRoom = e.room || e.subject;
      let cleanCode = rawRoom.replace(/^.*?:\s*/, '').trim();
      cleanCode = cleanCode.replace(/^Room\s*/i, '').trim().toUpperCase();

      if (cleanCode) {
        const isStudyRoom = cleanCode.startsWith('6') || e.subject.toLowerCase().includes('study');
        if (!discoveredRoomsMap.has(cleanCode)) {
          discoveredRoomsMap.set(cleanCode, {
            id: `room-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: `Room ${cleanCode}`,
            code: cleanCode,
            block: cleanCode.startsWith('6') ? 'Sixth Form Centre' : cleanCode.startsWith('CP') ? 'Computing Suite' : 'Main Block',
            floor: 'Floor 1',
            capacity: 30,
            type: isStudyRoom ? 'study_room' : cleanCode.startsWith('CP') ? 'computer_lab' : 'classroom',
            features: isStudyRoom 
              ? ['Sixth Form Study', 'Silent Study Area', 'Power Outlets'] 
              : ['Interactive Display', 'Whiteboard'],
            isCustom: false,
          });
        }

        const roomObj = discoveredRoomsMap.get(cleanCode)!;
        discoveredBookings.push({
          id: `wrenn-live-${idx}-${e.event_id || Date.now()}`,
          roomId: roomObj.id,
          subject: e.subject,
          teacher: e.teacher || undefined,
          dayOfWeek: (e.day ?? 0) + 1, // 0 (Mon) -> 1
          startTime: e.start,
          endTime: e.end,
          source: 'arbor',
        });
      }
    });

    return NextResponse.json({
      success: true,
      school: 'Wrenn School',
      scrapedAt: data.scraped_at,
      weekLabel: data.week_label,
      rooms: Array.from(discoveredRoomsMap.values()),
      bookings: discoveredBookings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
