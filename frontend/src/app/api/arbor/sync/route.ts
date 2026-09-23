import { NextRequest, NextResponse } from 'next/server';
import { Booking, Room } from '@/types';
import { parseICS, parseArborCSV } from '@/lib/importers';

interface ArborSyncRequest {
  schoolUrl: string; // e.g. "https://myschool.uk.arbor.sc"
  cookie: string;    // e.g. "arbor_session=abc; ..."
  date?: string;     // YYYY-MM-DD
}

export async function POST(req: NextRequest) {
  try {
    const body: ArborSyncRequest = await req.json();
    let { schoolUrl, cookie, date } = body;

    if (!schoolUrl || !cookie) {
      return NextResponse.json(
        { error: 'School URL and Arbor session cookies are required.' },
        { status: 400 }
      );
    }

    // Clean URL
    schoolUrl = schoolUrl.trim().replace(/\/+$/, '');
    if (!schoolUrl.startsWith('http://') && !schoolUrl.startsWith('https://')) {
      schoolUrl = `https://${schoolUrl}`;
    }

    const headers: Record<string, string> = {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/html, text/calendar, */*',
      'Accept-Language': 'en-GB,en;q=0.9',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Attempt multiple known Arbor timetable endpoints in priority order
    const endpointsToTry = [
      `${schoolUrl}/rest-v2/events/calendar?start=${targetDate}&end=${targetDate}`,
      `${schoolUrl}/timetable/events?date=${targetDate}`,
      `${schoolUrl}/my-calendar/export.ics`,
      `${schoolUrl}/school-timetable/grid`,
      `${schoolUrl}/my-timetable`,
    ];

    let fetchedData: any = null;
    let fetchedType: 'json' | 'ics' | 'html' | null = null;
    let successfulUrl = '';

    for (const endpoint of endpointsToTry) {
      try {
        const res = await fetch(endpoint, {
          method: 'GET',
          headers,
          redirect: 'follow',
          cache: 'no-store',
        });

        if (!res.ok) continue;

        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();

        // Check if we were redirected to login page (invalid cookie)
        if (text.includes('id="login-form"') || text.includes('name="login"') || text.includes('Sign in to Arbor')) {
          return NextResponse.json(
            { error: 'Arbor session cookie has expired or is invalid. Please copy a fresh cookie from your logged-in Arbor tab.' },
            { status: 401 }
          );
        }

        if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
          try {
            fetchedData = JSON.parse(text);
            fetchedType = 'json';
            successfulUrl = endpoint;
            break;
          } catch {}
        } else if (text.includes('BEGIN:VCALENDAR') || text.includes('BEGIN:VEVENT')) {
          fetchedData = text;
          fetchedType = 'ics';
          successfulUrl = endpoint;
          break;
        } else if (text.includes('<table') || text.includes('timetable') || text.includes('grid')) {
          fetchedData = text;
          fetchedType = 'html';
          successfulUrl = endpoint;
          break;
        }
      } catch (err) {
        // continue to next endpoint
      }
    }

    const discoveredRooms: Room[] = [];
    const discoveredBookings: Booking[] = [];

    if (fetchedType === 'ics' && typeof fetchedData === 'string') {
      const parsedBookings = parseICS(fetchedData, []);
      discoveredBookings.push(...parsedBookings);
    } else if (fetchedType === 'json' && fetchedData) {
      // Parse JSON calendar events
      const events = Array.isArray(fetchedData) ? fetchedData : fetchedData.events || fetchedData.data || [];
      
      events.forEach((item: any, idx: number) => {
        const roomName = item.room || item.location || item.room_name || item.room_code || 'Unspecified Room';
        const cleanCode = roomName.replace(/room\s*/i, '').trim().toUpperCase();
        
        let existingRoom = discoveredRooms.find(r => r.code === cleanCode);
        if (!existingRoom && cleanCode) {
          existingRoom = {
            id: `room-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: roomName.startsWith('Room') ? roomName : `Room ${roomName}`,
            code: cleanCode,
            block: item.block || 'Main Building',
            floor: item.floor || 'Floor 1',
            capacity: item.capacity || 30,
            type: cleanCode.toLowerCase().includes('lab') ? 'science_lab' : cleanCode.toLowerCase().includes('it') ? 'computer_lab' : 'classroom',
            features: ['Interactive Board', 'Whiteboard'],
            isCustom: false
          };
          discoveredRooms.push(existingRoom);
        }

        if (existingRoom) {
          const startTime = item.start_time || item.startTime || (item.start ? item.start.substring(11, 16) : '09:00');
          const endTime = item.end_time || item.endTime || (item.end ? item.end.substring(11, 16) : '10:00');

          discoveredBookings.push({
            id: `arbor-live-${idx}-${Date.now()}`,
            roomId: existingRoom.id,
            subject: item.subject || item.title || item.name || 'Arbor Class',
            teacher: item.teacher || item.staff || item.teacher_name,
            classGroup: item.group || item.class || item.registration_form,
            dayOfWeek: new Date(targetDate).getDay(),
            date: targetDate,
            startTime,
            endTime,
            source: 'arbor',
          });
        }
      });
    } else if (fetchedType === 'html' && typeof fetchedData === 'string') {
      // Parse HTML timetable table (regex based extraction of rooms and classes)
      const roomRegex = /(?:Room|Lab|Suite|Hall)\s*([A-Za-z0-9\-\/]+)/gi;
      const matches = Array.from(fetchedData.matchAll(roomRegex));
      
      const foundCodes = new Set<string>();
      matches.forEach(m => {
        const code = m[1].toUpperCase();
        if (code && code.length <= 10 && !foundCodes.has(code)) {
          foundCodes.add(code);
          discoveredRooms.push({
            id: `room-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: `Room ${code}`,
            code: code,
            block: 'School Block',
            floor: 'Floor 1',
            capacity: 30,
            type: code.includes('LAB') ? 'science_lab' : code.includes('IT') ? 'computer_lab' : 'classroom',
            features: ['Display Screen', 'Whiteboard'],
            isCustom: false,
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected to Arbor Live at ${schoolUrl}!`,
      endpoint: successfulUrl || 'arbor-direct',
      dataType: fetchedType || 'raw',
      roomsCount: discoveredRooms.length,
      bookingsCount: discoveredBookings.length,
      rooms: discoveredRooms,
      bookings: discoveredBookings,
      syncTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Arbor Sync API Error:', error);
    return NextResponse.json(
      { error: `Failed to connect to Arbor: ${error?.message || 'Network error'}` },
      { status: 500 }
    );
  }
}
