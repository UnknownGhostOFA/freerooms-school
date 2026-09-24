import { Booking, Room } from '@/types';
import { getCurrentSchoolWeek } from '@/lib/crowdsourceEngine';

interface ArborSession {
  schoolUrl: string;
  username: string;
  password?: string;
  cookies: string;
  studentId?: number;
  expiresAt: number;
  lastSync: string;
  cachedRooms: Room[];
  cachedBookings: (Booking & { weekType?: 'A' | 'B' })[];
}

const sessionStore: Map<string, ArborSession> = new Map();

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * Automates logging into Arbor via the internal API
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
 * Fetches full 2-week timetable entries from Arbor (Week A & Week B, Mon-Fri)
 */
export async function fetchLiveArborData({
  schoolUrl,
  username,
}: {
  schoolUrl: string;
  username: string;
}): Promise<{ rooms: Room[]; bookings: (Booking & { weekType: 'A' | 'B' })[]; syncTime: string }> {
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

  // Calculate 2 consecutive school weeks (Week 1 & Week 2)
  const now = new Date();
  const thisMonday = getMonday(now);
  const nextMonday = addDays(thisMonday, 7);

  const week1Start = formatDateISO(thisMonday);
  const week1End = formatDateISO(addDays(thisMonday, 4));

  const week2Start = formatDateISO(nextMonday);
  const week2End = formatDateISO(addDays(nextMonday, 4));

  const week1Type: 'A' | 'B' = getCurrentSchoolWeek(thisMonday);
  const week2Type: 'A' | 'B' = week1Type === 'A' ? 'B' : 'A';

  const weeksToFetch = [
    { start: week1Start, end: week1End, type: week1Type },
    { start: week2Start, end: week2End, type: week2Type }
  ];

  const discoveredRoomsMap = new Map<string, Room>();
  const discoveredBookings: (Booking & { weekType: 'A' | 'B' })[] = [];

  for (const weekReq of weeksToFetch) {
    const calUrl = `${cleanUrl}/calendar-entry/list-static/format/json/`;
    const payload = {
      action_params: {
        view: 'multiday',
        startDate: weekReq.start,
        endDate: weekReq.end,
        filters: [{
          field_name: 'object',
          value: {
            _objectTypeId: 1,
            _objectId: studentId
          }
        }]
      }
    };

    try {
      const calRes = await fetch(calUrl, {
        method: 'POST',
        headers: {
          'Cookie': currentSession.cookies,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload)
      });

      if (calRes.ok) {
        const calData = await calRes.json().catch(() => ({}));
        const pages = calData.items?.[0]?.fields?.response?.value?.pages || [];

        for (const page of pages) {
          if (!page.html) continue;
          const rawEvents = parseArborHtmlEvents(page.html);

          for (const ev of rawEvents) {
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

            const cleanCode = cleanRoomName(roomRaw || ev.subject);

            if (cleanCode) {
              if (!discoveredRoomsMap.has(cleanCode)) {
                discoveredRoomsMap.set(cleanCode, {
                  id: `room-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                  name: `Room ${cleanCode}`,
                  code: cleanCode,
                  block: cleanCode.startsWith('6') ? 'Sixth Form Centre' : 'Main Block',
                  capacity: 30,
                  type: isStudyClass ? 'study_room' : 'classroom',
                  features: ['Sixth Form Study'],
                  isCustom: false,
                  notes: isStudyClass ? 'Designated Study Space' : undefined
                });
              }

              const roomObj = discoveredRoomsMap.get(cleanCode)!;

              discoveredBookings.push({
                id: `arbor-${weekReq.type}-${ev.eventId || Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                roomId: roomObj.id,
                subject: ev.subject,
                teacher: teacherRaw || undefined,
                dayOfWeek: ev.dayIndex + 1, // 0 -> 1 (Mon), 4 -> 5 (Fri)
                startTime: ev.start,
                endTime: ev.end,
                source: 'arbor',
                weekType: weekReq.type,
                notes: isStudyClass ? '6th Form Study Class' : undefined
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch week ${weekReq.type}:`, e);
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
  let clean = raw.replace(/^.*?:\s*/i, '').trim();
  clean = clean.replace(/^room[\s\-_]*/i, '').trim();
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
  return clean.toUpperCase();
}

function extractCookiesFromResponse(resp: any): string {
  const setCookies = resp.headers?.raw?.()['set-cookie'] || [];
  if (Array.isArray(setCookies) && setCookies.length > 0) {
    return setCookies.map((c: string) => c.split(';')[0]).join('; ');
  }
  const cookieHeader = resp.headers?.get?.('set-cookie') || '';
  return cookieHeader.split(';')[0] || '';
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

  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  const eventRegex = /<div[^>]*class=["'][^"']*mis-cal-event[^"']*["'][^>]*data-eventid=["']([^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi;
  const timeRegex = /class=["'][^"']*mis-cal-event-time[^"']*["']>([^<]+)</i;
  const titleRegex = /<b[^>]*class=["']title["'][^>]*>([^<]+)<\/b>/i;

  const cells = Array.from(html.matchAll(cellRegex));

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
        const timeParts = timeMatch[1].trim().split(/\s*-\s*/);
        events.push({
          eventId,
          start: timeParts[0] || '09:00',
          end: timeParts[1] || '10:00',
          subject: titleMatch[1].trim(),
          dayIndex,
        });
      }
    }
  }

  return events;
}
