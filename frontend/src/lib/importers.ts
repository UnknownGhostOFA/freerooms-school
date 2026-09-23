import { Booking, Room } from '@/types';

// Parse standard iCalendar / .ics format exported from Arbor or Microsoft Teams / Outlook
export function parseICS(icsContent: string, existingRooms: Room[]): Booking[] {
  const bookings: Booking[] = [];
  const lines = icsContent.split(/\r\n|\n|\r/);
  
  let inEvent = false;
  let summary = '';
  let dtStart = '';
  let dtEnd = '';
  let location = '';
  let description = '';
  let uid = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      summary = '';
      dtStart = '';
      dtEnd = '';
      location = '';
      description = '';
      uid = `ics-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    } else if (line === 'END:VEVENT') {
      if (inEvent) {
        inEvent = false;
        
        // Extract room name from location or summary
        const detectedRoom = matchRoom(location || summary || '', existingRooms);
        const { date, startTime, endTime, dayOfWeek } = parseICSDateTimes(dtStart, dtEnd);

        if (detectedRoom && startTime && endTime) {
          bookings.push({
            id: uid,
            roomId: detectedRoom.id,
            subject: summary || 'Imported Event',
            teacher: extractTeacherFromDescription(description),
            dayOfWeek: dayOfWeek,
            date: date,
            startTime: startTime,
            endTime: endTime,
            source: summary.toLowerCase().includes('teams') || description.toLowerCase().includes('teams') ? 'teams' : 'arbor',
            notes: description,
          });
        }
      }
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.substring(8);
      } else if (line.startsWith('LOCATION:')) {
        location = line.substring(9);
      } else if (line.startsWith('DTSTART')) {
        dtStart = line.split(':')[1] || '';
      } else if (line.startsWith('DTEND')) {
        dtEnd = line.split(':')[1] || '';
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.substring(12);
      } else if (line.startsWith('UID:')) {
        uid = line.substring(4);
      }
    }
  }

  return bookings;
}

// Parse Arbor Timetable CSV (supports columns: Period, Start Time, End Time, Room, Subject, Teacher, Day)
export function parseArborCSV(csvContent: string, existingRooms: Room[]): { bookings: Booking[]; newRooms: Room[] } {
  const lines = csvContent.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return { bookings: [], newRooms: [] };

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  const roomIdx = headers.findIndex(h => h.includes('room') || h.includes('location'));
  const subjectIdx = headers.findIndex(h => h.includes('subject') || h.includes('class') || h.includes('course') || h.includes('title'));
  const teacherIdx = headers.findIndex(h => h.includes('teacher') || h.includes('staff'));
  const startIdx = headers.findIndex(h => h.includes('start') || h.includes('time'));
  const endIdx = headers.findIndex(h => h.includes('end'));
  const dayIdx = headers.findIndex(h => h.includes('day') || h.includes('date'));
  const periodIdx = headers.findIndex(h => h.includes('period'));

  const bookings: Booking[] = [];
  const newRooms: Room[] = [];
  const roomsMap = new Map<string, Room>(existingRooms.map(r => [r.name.toLowerCase(), r]));
  existingRooms.forEach(r => roomsMap.set(r.code.toLowerCase(), r));

  const dayMap: Record<string, number> = {
    'mon': 1, 'monday': 1, '1': 1,
    'tue': 2, 'tues': 2, 'tuesday': 2, '2': 2,
    'wed': 3, 'wednesday': 3, '3': 3,
    'thu': 4, 'thur': 4, 'thurs': 4, 'thursday': 4, '4': 4,
    'fri': 5, 'friday': 5, '5': 5,
    'sat': 6, 'saturday': 6, '6': 6,
    'sun': 0, 'sunday': 0, '0': 0,
  };

  for (let i = 1; i < lines.length; i++) {
    const row = splitCSVLine(lines[i]);
    if (row.length === 0) continue;

    const roomText = (roomIdx !== -1 ? row[roomIdx] : '').trim();
    if (!roomText) continue;

    let room = matchRoom(roomText, Array.from(roomsMap.values()));

    if (!room) {
      // Auto-create room if not found
      const cleanCode = roomText.replace(/room\s*/i, '').trim().toUpperCase();
      room = {
        id: `room-custom-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: `Room ${cleanCode}`,
        code: cleanCode,
        block: 'Main Building',
        floor: 'Floor 1',
        capacity: 30,
        type: cleanCode.toLowerCase().includes('lab') ? 'science_lab' : cleanCode.toLowerCase().includes('it') || cleanCode.toLowerCase().includes('cs') ? 'computer_lab' : 'classroom',
        features: ['Whiteboard', 'Display Screen'],
        isCustom: true
      };
      newRooms.push(room);
      roomsMap.set(room.name.toLowerCase(), room);
      roomsMap.set(room.code.toLowerCase(), room);
    }

    const subject = subjectIdx !== -1 ? row[subjectIdx] : 'Class Session';
    const teacher = teacherIdx !== -1 ? row[teacherIdx] : '';
    let startTime = startIdx !== -1 ? formatTimeString(row[startIdx]) : '09:00';
    let endTime = endIdx !== -1 ? formatTimeString(row[endIdx]) : '10:00';
    
    // If end time is missing or identical, default to 1 hour
    if (startTime === endTime) {
      const [h, m] = startTime.split(':').map(Number);
      endTime = `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    let dayOfWeek = 1;
    let dateStr: string | undefined = undefined;

    if (dayIdx !== -1) {
      const dayRaw = row[dayIdx].toLowerCase().trim();
      if (dayMap[dayRaw] !== undefined) {
        dayOfWeek = dayMap[dayRaw];
      } else if (dayRaw.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateStr = dayRaw;
        dayOfWeek = new Date(dayRaw).getDay();
      }
    }

    bookings.push({
      id: `csv-${i}-${Date.now()}`,
      roomId: room.id,
      subject: subject || 'Class Session',
      teacher: teacher || undefined,
      dayOfWeek: dayOfWeek,
      date: dateStr,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      periodId: periodIdx !== -1 ? row[periodIdx] : undefined,
      source: 'arbor',
    });
  }

  return { bookings, newRooms };
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function formatTimeString(timeStr: string): string {
  if (!timeStr) return '09:00';
  const clean = timeStr.trim().toLowerCase();
  
  // Format "09:30 AM" or "9:30" or "0930"
  if (clean.includes(':')) {
    const parts = clean.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1].substring(0, 2), 10) || 0;
    if (clean.includes('pm') && h < 12) h += 12;
    if (clean.includes('am') && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  
  return '09:00';
}

function matchRoom(text: string, rooms: Room[]): Room | null {
  if (!text) return null;
  const cleanText = text.toLowerCase().trim();

  // Exact match on code or name
  for (const r of rooms) {
    if (r.code.toLowerCase() === cleanText || r.name.toLowerCase() === cleanText) {
      return r;
    }
  }

  // Word boundary match (e.g., "Room 6B", "6B", "Lab 1", "6D")
  for (const r of rooms) {
    const codeRegex = new RegExp(`\\b${r.code}\\b`, 'i');
    const nameRegex = new RegExp(`\\b${r.name}\\b`, 'i');
    if (codeRegex.test(cleanText) || nameRegex.test(cleanText)) {
      return r;
    }
  }

  return null;
}

function parseICSDateTimes(dtStart: string, dtEnd: string) {
  let date: string | undefined = undefined;
  let startTime = '09:00';
  let endTime = '10:00';
  let dayOfWeek = 1;

  if (dtStart.includes('T')) {
    const parts = dtStart.split('T');
    const datePart = parts[0];
    const timePart = parts[1];

    if (datePart.length === 8) {
      const y = datePart.substring(0, 4);
      const m = datePart.substring(4, 6);
      const d = datePart.substring(6, 8);
      date = `${y}-${m}-${d}`;
      dayOfWeek = new Date(`${y}-${m}-${d}T12:00:00`).getDay();
    }

    if (timePart.length >= 4) {
      startTime = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
    }
  }

  if (dtEnd.includes('T')) {
    const timePart = dtEnd.split('T')[1];
    if (timePart && timePart.length >= 4) {
      endTime = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
    }
  }

  return { date, startTime, endTime, dayOfWeek };
}

function extractTeacherFromDescription(desc: string): string | undefined {
  if (!desc) return undefined;
  const match = desc.match(/(?:Teacher|Staff|Organiser|Organizer):\s*([^\r\n,]+)/i);
  return match ? match[1].trim() : undefined;
}
