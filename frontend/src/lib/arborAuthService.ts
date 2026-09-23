import { Booking, Room } from '@/types';

interface ArborSession {
  schoolUrl: string;
  username: string;
  password?: string;
  cookies: string;
  studentId?: number;
  expiresAt: number;
  lastSync: string;
  cachedRooms: Room[];
  cachedBookings: Booking[];
}

const sessionStore: Map<string, ArborSession> = new Map();

/**
 * Automates logging into Arbor via the internal API tested in timetable.py
 */
export async function authenticateArbor({
  schoolUrl,
  username,
  password,
  storePasswordForAutoRenewal = true
}: {
  schoolUrl: string;
  username: string;
  password: string;
  storePasswordForAutoRenewal?: boolean;
}): Promise<{ success: boolean; cookies: string; studentId?: number; message: string }> {
  let cleanUrl = schoolUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const loginUrl = `${cleanUrl}/auth/login?lang=en`;
  const payload = {
    items: [{
      username: username.trim(),
      password: password,
    }]
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': `${cleanUrl}/?/home-ui/index`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  };

  const resp = await fetch(loginUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const cookies = extractCookiesFromResponse(resp);
  const data = await resp.json().catch(() => ({}));

  if (!data.success && !cookies.includes('arbor_session') && !cookies.includes('PHPSESSID')) {
    throw new Error(data.errors?.[0]?.message || 'Arbor login failed. Please check your school URL, email, and password.');
  }

  // Step 2: Fetch Student ID from current user settings
  let studentId: number | undefined = undefined;
  try {
    const settingsRes = await fetch(`${cleanUrl}/auth/current-user-settings/format/json`, {
      headers: {
        'Cookie': cookies,
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.items?.[0]) {
        const calUrl = settingsData.items[0].calendarUrl || '';
        const match = calUrl.match(/student-id\/(\d+)/);
        if (match) {
          studentId = parseInt(match[1], 10);
        }
      }
    }
  } catch (e) {
    console.warn('Could not determine student ID from settings:', e);
  }

  const sessionKey = `${cleanUrl}::${username.toLowerCase()}`;
  sessionStore.set(sessionKey, {
    schoolUrl: cleanUrl,
    username,
    password: storePasswordForAutoRenewal ? password : undefined,
    cookies,
    studentId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 12, // 12h
    lastSync: new Date().toISOString(),
    cachedRooms: [],
    cachedBookings: [],
  });

  return {
    success: true,
    cookies,
    studentId,
    message: 'Arbor authentication successful!'
  };
}

/**
 * Fetches timetable entries from Arbor using the multiday calendar endpoint and tooltips
 */
export async function fetchLiveArborData({
  schoolUrl,
  username,
  date,
}: {
  schoolUrl: string;
  username: string;
  date?: string;
}): Promise<{ rooms: Room[]; bookings: Booking[]; syncTime: string }> {
  let cleanUrl = schoolUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  const sessionKey = `${cleanUrl}::${username.toLowerCase()}`;
  let session = sessionStore.get(sessionKey);

  if (!session || Date.now() >= session.expiresAt) {
    if (session?.password) {
      await authenticateArbor({
        schoolUrl: cleanUrl,
        username,
        password: session.password,
      });
      session = sessionStore.get(sessionKey);
    } else {
      throw new Error('Arbor session expired. Please log in again.');
    }
  }

  if (!session) {
    throw new Error('No active Arbor session found.');
  }

  const currentSession: ArborSession = session;
  const studentId = currentSession.studentId || 1;

  // Fetch weekly multiday calendar
  const calUrl = `${cleanUrl}/calendar-entry/list-static/format/json/`;
  const payload = {
    action_params: {
      view: 'multiday',
      startDate: null,
      endDate: null,
      filters: [{
        field_name: 'object',
        value: {
          _objectTypeId: 1,
          _objectId: studentId
        }
      }]
    }
  };

  const calRes = await fetch(calUrl, {
    method: 'POST',
    headers: {
      'Cookie': currentSession.cookies,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload)
  });

  const calData = await calRes.json().catch(() => ({}));
  const pages = calData.items?.[0]?.fields?.response?.value?.pages || [];

  const discoveredRoomsMap = new Map<string, Room>();
  const discoveredBookings: Booking[] = [];

  const dayMap: Record<number, string> = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday'
  };

  // Extract HTML pages
  for (const page of pages) {
    if (!page.html) continue;

    const rawEvents = parseArborHtmlEvents(page.html);

    for (const ev of rawEvents) {
      // Fetch room and teacher tooltip
      let roomRaw = '';
      let teacherRaw = '';

      if (ev.eventId) {
        const tooltipUrl = `${cleanUrl}/students/calendar-entry/tooltip/id/${ev.eventId}`;
        try {
          const tRes = await fetch(tooltipUrl, {
            headers: {
              'Cookie': currentSession.cookies,
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          if (tRes.ok) {
            const tHtml = await tRes.text();
            const locMatch = tHtml.match(/<b>Location<\/b>:<span>(.*?)<\/span>/i);
            const staffMatch = tHtml.match(/<b>Staff<\/b>:<span>(.*?)<\/span>/i);
            if (locMatch) roomRaw = locMatch[1].trim();
            if (staffMatch) teacherRaw = staffMatch[1].trim();
          }
        } catch {}
      }

      const isStudyClass = ev.subject.toLowerCase().includes('study') || 
                           ev.subject.toLowerCase().includes('6th form') || 
                           ev.subject.toLowerCase().includes('free');

      // Clean room name e.g. "Wrenn School: 17" -> "17", "1: 6D" -> "6D", "1: CP3" -> "CP3"
      const cleanRoomCode = cleanRoomName(roomRaw || ev.subject);

      if (cleanRoomCode) {
        if (!discoveredRoomsMap.has(cleanRoomCode)) {
          const isStudyRoom = cleanRoomCode.startsWith('6') || isStudyClass;
          discoveredRoomsMap.set(cleanRoomCode, {
            id: `room-${cleanRoomCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: `Room ${cleanRoomCode}`,
            code: cleanRoomCode,
            block: cleanRoomCode.startsWith('6') ? 'Sixth Form Centre' : cleanRoomCode.startsWith('CP') ? 'Computing Suite' : 'Main Block',
            floor: 'Floor 1',
            capacity: 30,
            type: isStudyRoom ? 'study_room' : cleanRoomCode.startsWith('CP') ? 'computer_lab' : 'classroom',
            features: isStudyRoom 
              ? ['Sixth Form Study', 'Silent Study Area', 'Power Outlets'] 
              : ['Interactive Display', 'Whiteboard'],
            isCustom: false,
            notes: isStudyClass ? 'Designated Study Space' : undefined
          });
        }

        const roomObj = discoveredRoomsMap.get(cleanRoomCode)!;

        discoveredBookings.push({
          id: `arbor-${ev.eventId || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          roomId: roomObj.id,
          subject: ev.subject,
          teacher: teacherRaw || undefined,
          dayOfWeek: ev.dayIndex + 1, // 0 -> 1 (Mon), 4 -> 5 (Fri)
          startTime: ev.start,
          endTime: ev.end,
          source: 'arbor',
          notes: isStudyClass ? '6th Form Study Class' : undefined
        });
      }
    }
  }

  const rooms = Array.from(discoveredRoomsMap.values());
  currentSession.lastSync = new Date().toISOString();
  currentSession.cachedRooms = rooms;
  currentSession.cachedBookings = discoveredBookings;

  return {
    rooms,
    bookings: discoveredBookings,
    syncTime: currentSession.lastSync,
  };
}

export function getSessionStatus(schoolUrl: string, username: string) {
  let cleanUrl = schoolUrl.trim().replace(/\/+$/, '');
  const key = `${cleanUrl}::${username.toLowerCase()}`;
  const session = sessionStore.get(key);

  if (!session) return { isLoggedIn: false };

  return {
    isLoggedIn: true,
    expiresAt: session.expiresAt,
    lastSync: session.lastSync,
    hasAutoRenew: !!session.password,
    cachedRoomsCount: session.cachedRooms.length,
    cachedBookingsCount: session.cachedBookings.length,
  };
}

function cleanRoomName(raw: string): string {
  if (!raw) return '';
  let clean = raw.replace(/^.*?:\s*/, '').trim(); // strip "Wrenn School:" or "1:"
  clean = clean.replace(/^Room\s*/i, '').trim();
  return clean.toUpperCase();
}

interface ParsedHtmlEvent {
  eventId: string;
  start: string;
  end: string;
  subject: string;
  dayIndex: number;
}

function parseArborHtmlEvents(html: string): ParsedHtmlEvent[] {
  const events: ParsedHtmlEvent[] = [];
  
  // Regex extraction from mis-cal-day table
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const eventRegex = /<div[^>]*class=["'][^"']*mis-cal-event[^"']*["'][^>]*data-eventid=["']([^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi;
  const timeRegex = /class=["'][^"']*mis-cal-event-time[^"']*["']>([^<]+)</i;
  const titleRegex = /<b[^>]*class=["']title["'][^>]*>([^<]+)<\/b>/i;

  const cells = Array.from(html.matchAll(cellRegex));
  
  // Cells 1 to 5 correspond to Monday - Friday
  for (let cellIdx = 1; cellIdx < Math.min(6, cells.length); cellIdx++) {
    const cellHtml = cells[cellIdx][1];
    const dayIndex = cellIdx - 1; // 0=Mon .. 4=Fri

    const cellEvents = Array.from(cellHtml.matchAll(eventRegex));
    for (const ev of cellEvents) {
      const eventId = ev[1];
      const evInner = ev[2];

      const timeMatch = evInner.match(timeRegex);
      const titleMatch = evInner.match(titleRegex);

      if (timeMatch && titleMatch) {
        const timeText = timeMatch[1].trim();
        const title = titleMatch[1].trim();

        if (timeText.includes('-')) {
          const parts = timeText.split('-');
          const start = parts[0].trim();
          const end = parts[1].trim();

          events.push({
            eventId,
            start,
            end,
            subject: title,
            dayIndex,
          });
        }
      }
    }
  }

  return events;
}

function extractCookiesFromResponse(res: Response): string {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) return '';

  return setCookie
    .split(/,(?=[^;]+;)/)
    .map(c => c.split(';')[0].trim())
    .join('; ');
}
