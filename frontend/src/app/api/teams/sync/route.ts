import { NextRequest, NextResponse } from 'next/server';
import { Booking, Room } from '@/types';
import { parseICS } from '@/lib/importers';

interface TeamsSyncRequest {
  cookieOrToken: string;
  calendarUrl?: string;
  date?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: TeamsSyncRequest = await req.json();
    const { cookieOrToken, calendarUrl, date } = body;

    if (!cookieOrToken && !calendarUrl) {
      return NextResponse.json(
        { error: 'Microsoft Teams cookie, auth token, or calendar link is required.' },
        { status: 400 }
      );
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const discoveredBookings: Booking[] = [];
    const discoveredRooms: Room[] = [];

    // If a direct Outlook/Teams iCal URL is provided:
    if (calendarUrl && calendarUrl.startsWith('http')) {
      const res = await fetch(calendarUrl, {
        headers: {
          'Cookie': cookieOrToken || '',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const icsText = await res.text();
        const parsed = parseICS(icsText, []);
        discoveredBookings.push(...parsed);
      }
    } else if (cookieOrToken.startsWith('eyJ') || cookieOrToken.startsWith('Bearer ')) {
      // It's a Microsoft Graph OAuth Bearer Token
      const token = cookieOrToken.replace(/^Bearer\s+/i, '');
      const graphRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${targetDate}T00:00:00Z&endDateTime=${targetDate}T23:59:59Z&$select=subject,location,start,end,organizer,bodyPreview`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (graphRes.ok) {
        const data = await graphRes.json();
        const items = data.value || [];

        items.forEach((item: any, idx: number) => {
          const loc = item.location?.displayName || '';
          const cleanCode = loc.replace(/room\s*/i, '').trim().toUpperCase();

          if (cleanCode) {
            let room = discoveredRooms.find(r => r.code === cleanCode);
            if (!room) {
              room = {
                id: `room-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                name: `Room ${cleanCode}`,
                code: cleanCode,
                block: 'School Block',
                floor: 'Floor 1',
                capacity: 30,
                type: 'classroom',
                features: ['Interactive Display', 'Teams Room'],
                isCustom: false,
              };
              discoveredRooms.push(room);
            }

            const startTime = item.start?.dateTime ? item.start.dateTime.substring(11, 16) : '09:00';
            const endTime = item.end?.dateTime ? item.end.dateTime.substring(11, 16) : '10:00';

            discoveredBookings.push({
              id: `teams-live-${idx}-${Date.now()}`,
              roomId: room.id,
              subject: item.subject || 'Teams Meeting',
              teacher: item.organizer?.emailAddress?.name,
              dayOfWeek: new Date(targetDate).getDay(),
              date: targetDate,
              startTime,
              endTime,
              source: 'teams',
            });
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced Microsoft Teams calendar events!',
      rooms: discoveredRooms,
      bookings: discoveredBookings,
      syncTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Teams Sync API Error:', error);
    return NextResponse.json(
      { error: `Teams sync failed: ${error?.message || 'Network error'}` },
      { status: 500 }
    );
  }
}
