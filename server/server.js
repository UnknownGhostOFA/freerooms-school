require('dotenv').config();
const dns = require('dns');

// Configure reliable public DNS servers to resolve MongoDB SRV records across all networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback to system DNS
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. Mongoose Schema: Hierarchical Study Rooms
// ==========================================
const FreeRoomSchema = new mongoose.Schema({
  weekType: { type: String, enum: ['A', 'B'], required: true, index: true },
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    required: true,
    index: true
  },
  dayNumber: { type: Number, required: true, min: 1, max: 5 }, // 1=Mon .. 5=Fri
  dayName: { type: String, required: true },
  lesson: { type: Number, required: true, min: 1, max: 5, index: true }, // 1 to 5
  periodId: { type: String, required: true }, // 'p1' to 'p5'
  roomCode: { type: String, required: true, uppercase: true, trim: true },
  subject: { type: String, default: '6th Form Study' },
  supervisor: { type: String, default: 'Study Supervisor' },
  createdByEmail: { type: String, lowercase: true, trim: true }, // Submitting student's email for ownership check
  contributedByEmails: [{ type: String, lowercase: true, trim: true }], // Debug only - NEVER exposed on public API
  isManual: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure unique compound index for Week + Day + Lesson + RoomCode
FreeRoomSchema.index({ weekType: 1, day: 1, lesson: 1, roomCode: 1 }, { unique: true });

const FreeRoom = mongoose.models.FreeRoom || mongoose.model('FreeRoom', FreeRoomSchema);

let isAtlasConnected = false;

// ==========================================
// 2. Connect to MongoDB Atlas & Seed Baseline
// ==========================================
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    isAtlasConnected = true;
    console.log('[PASS] MongoDB Atlas Connected Successfully.');
  })
  .catch((err) => {
    console.error('[ERROR] MongoDB Atlas Connection Error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isAtlasConnected = false;
    console.warn('[WARN] MongoDB Atlas Disconnected.');
  });

  mongoose.connection.on('connected', () => {
    isAtlasConnected = true;
    console.log('[PASS] MongoDB Atlas Reconnected.');
  });
} else {
  console.warn('[WARN] MONGODB_URI environment variable is not defined!');
}

// Seed baseline weeks from arbor-live-weeks.json into MongoDB Atlas without deleting existing
async function seedBaselineFromLocalJson() {
  try {
    let filePath = path.join(__dirname, 'arbor-live-weeks.json');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '..', 'frontend', 'arbor-live-weeks.json');
    }
    if (!fs.existsSync(filePath)) return;

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const properDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const processEvents = async (events, weekType) => {
      let dayIdx = -1;
      for (const ev of (events || [])) {
        if (ev.start === '08:40') dayIdx++;
        const p = matchTimeToPeriod(ev.start);
        if (ev.isStudy && p !== null) {
          const dNum = Math.max(1, Math.min(5, dayIdx + 1));
          const daySlug = dayNames[dNum - 1];
          const cleanCode = cleanRoomCode(ev.room);
          if (!cleanCode) continue;

          await FreeRoom.findOneAndUpdate(
            { weekType, day: daySlug, lesson: p.number, roomCode: cleanCode },
            {
              $set: {
                weekType,
                day: daySlug,
                dayNumber: dNum,
                dayName: properDayNames[dNum - 1],
                lesson: p.number,
                periodId: p.id,
                roomCode: cleanCode,
                subject: ev.subject || '6th Form Study',
                supervisor: ev.teacher || 'Study Supervisor',
                isManual: false,
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date(),
                contributedByEmails: ['system-baseline@wrennschool.org.uk']
              }
            },
            { upsert: true, new: true }
          );
        }
      }
    };

    await processEvents(raw.weekA, 'A');
    await processEvents(raw.weekB, 'B');
    console.log('[SEED] Baseline study rooms checked & populated into MongoDB Atlas.');
  } catch (err) {
    console.warn('[SEED] Baseline seeding notice:', err.message);
  }
}

// ==========================================
// 3. Helper Functions
// ==========================================
function cleanRoomCode(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  if (/common\s*room/i.test(str)) return '';

  let clean = str.replace(/^.*?:\s*/i, '');
  clean = clean.replace(/^room[\s\-_]*/i, '');
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
  clean = clean.toUpperCase();

  // Filter out non-room strings and Common Room
  const invalidCodes = [
    '6THFORMCOMMONROOM',
    'COMMONROOM',
    '6THFORM',
    'SIXTHFORM',
    'SIXTHFORMCOMMONROOM',
    'STUDY',
    'FREE',
    'COMMON'
  ];
  if (invalidCodes.includes(clean)) return '';

  return clean;
}

function matchTimeToPeriod(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  const mins = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);

  if (mins < 9 * 60 + 10) return null; // Form Time (08:40 - 09:10) -> Excluded
  if (mins < 10 * 60 + 10) return { id: 'p1', number: 1 };
  if (mins < 11 * 60 + 20) return { id: 'p2', number: 2 };
  if (mins < 12 * 60 + 30) return { id: 'p3', number: 3 };
  if (mins < 13 * 60 + 50) return { id: 'p4', number: 4 };
  return { id: 'p5', number: 5 };
}

function normalizeDay(dayInput) {
  if (!dayInput) return 'monday';
  const str = String(dayInput).toLowerCase().trim();
  if (str === '1' || str.startsWith('mon')) return 'monday';
  if (str === '2' || str.startsWith('tue')) return 'tuesday';
  if (str === '3' || str.startsWith('wed')) return 'wednesday';
  if (str === '4' || str.startsWith('thu')) return 'thursday';
  if (str === '5' || str.startsWith('fri')) return 'friday';
  return 'monday';
}

function normalizeLesson(lessonInput) {
  if (!lessonInput) return 1;
  const cleaned = String(lessonInput).toLowerCase().replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  if (num >= 1 && num <= 5) return num;
  return 1;
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d, days) {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateISO(d) {
  return d.toISOString().split('T')[0];
}

function getCurrentSchoolWeek(now = new Date()) {
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo % 2 === 1 ? 'A' : 'B';
}

function isStudySubject(subject, roomCode) {
  if (!subject && !roomCode) return false;
  const s = String(subject || '').toLowerCase();
  const r = String(roomCode || '').toUpperCase();
  return (
    s.includes('study') ||
    s.includes('6th form') ||
    s.includes('st1') ||
    s.includes('st2') ||
    s.includes('free') ||
    s.includes('private study') ||
    r.startsWith('6') ||
    r.startsWith('ST')
  );
}

// Convert Mongoose doc to public API room (stripping internal private contributor emails)
function toPublicRoom(doc, requestingUserEmail) {
  const reqEmail = String(requestingUserEmail || '').toLowerCase().trim();
  const isAdmin = reqEmail === 'localhost@localhost';
  const isOwner = reqEmail && (
    (doc.createdByEmail && doc.createdByEmail.toLowerCase() === reqEmail) ||
    (Array.isArray(doc.contributedByEmails) && doc.contributedByEmails.includes(reqEmail))
  );

  const createdAtTime = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
  const isWithin1Hour = (Date.now() - createdAtTime) <= 60 * 60 * 1000;
  const isLocked = doc.isManual ? !isWithin1Hour : true;
  const canDelete = isAdmin || (doc.isManual && isOwner && isWithin1Hour);

  return {
    id: `room-${doc.weekType}-${doc.dayNumber}-${doc.periodId}-${doc.roomCode}`,
    roomCode: doc.roomCode,
    weekType: doc.weekType,
    day: doc.day,
    dayOfWeek: doc.dayNumber,
    dayName: doc.dayName,
    periodId: doc.periodId,
    periodNumber: doc.lesson,
    lessonSubject: doc.subject,
    supervisor: doc.supervisor,
    contributedBy: doc.isManual ? 'Student Submission' : `Arbor (Week ${doc.weekType})`,
    isManual: !!doc.isManual,
    notes: doc.notes,
    createdAt: doc.createdAt,
    canDelete,
    isLocked,
    updatedAt: doc.updatedAt
  };
}

// ==========================================
// 4. API Endpoints
// ==========================================

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'MongoDB Atlas',
    connected: isAtlasConnected,
    keepAlive: 'active (10m)',
    timestamp: new Date().toISOString()
  });
});

// GET Specific Period for Day in WeekA: /api/weekA/:day/:lesson
app.get('/api/weekA/:day/:lesson', async (req, res) => {
  await handleSinglePeriodRequest('A', req.params.day, req.params.lesson, req.query.userEmail, res);
});

// GET Specific Period for Day in WeekB: /api/weekB/:day/:lesson
app.get('/api/weekB/:day/:lesson', async (req, res) => {
  await handleSinglePeriodRequest('B', req.params.day, req.params.lesson, req.query.userEmail, res);
});

async function handleSinglePeriodRequest(weekType, dayParam, lessonParam, requestingUserEmail, res) {
  try {
    const day = normalizeDay(dayParam);
    const lesson = normalizeLesson(lessonParam);

    let rooms = [];
    if (isAtlasConnected) {
      const records = await FreeRoom.find({ weekType, day, lesson }).lean();
      rooms = records.map(r => toPublicRoom(r, requestingUserEmail));
    }

    res.json({
      success: true,
      week: weekType,
      day,
      lesson,
      periodId: `p${lesson}`,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET Week A structured tree / list
app.get('/api/weekA', async (req, res) => {
  await handleWeekFullRequest('A', req.query.userEmail, res);
});

// GET Week B structured tree / list
app.get('/api/weekB', async (req, res) => {
  await handleWeekFullRequest('B', req.query.userEmail, res);
});

// GET /api/matrix?week={A|B} & /api/rooms/manual?week={A|B}
app.get(['/api/matrix', '/api/rooms/manual'], async (req, res) => {
  const rawWeek = req.query.week || req.query.weekType || 'A';
  const week = String(rawWeek).toUpperCase() === 'B' ? 'B' : 'A';
  await handleWeekFullRequest(week, req.query.userEmail, res);
});

async function handleWeekFullRequest(weekType, requestingUserEmail, res) {
  try {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    let records = [];

    if (isAtlasConnected) {
      records = await FreeRoom.find({ weekType }).lean();
    }

    // Build hierarchical structure: Day -> Period 1..5 -> Free Rooms
    const hierarchical = {};
    days.forEach(d => {
      hierarchical[d] = {
        period1: [],
        period2: [],
        period3: [],
        period4: [],
        period5: []
      };
    });

    const flatRooms = [];
    for (const r of records) {
      const publicRoom = toPublicRoom(r, requestingUserEmail);
      flatRooms.push(publicRoom);

      const dayKey = r.day;
      const periodKey = `period${r.lesson}`;
      if (hierarchical[dayKey] && hierarchical[dayKey][periodKey]) {
        hierarchical[dayKey][periodKey].push(publicRoom);
      }
    }

    res.json({
      success: true,
      week: weekType,
      count: flatRooms.length,
      hierarchy: hierarchical,
      studyRooms: flatRooms // Flat array for matrix grid compatibility
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ==========================================
// 5. Backend Arbor Authentication & Scraper Engine
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { schoolUrl = 'https://wrenn-school.uk.arbor.sc', username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUser = username.trim();

    // Hardcoded System Admin Account Check
    if (cleanUser.toLowerCase() === 'localhost@localhost' && password === 'localhost') {
      console.log('[AUTH] Admin login authenticated (localhost@localhost)');
      return res.json({
        success: true,
        isAdmin: true,
        message: 'Admin authentication successful! Access granted to debug & admin endpoints.',
        user: {
          username: 'localhost@localhost',
          displayName: 'System Administrator',
          userType: 'admin',
          isAdmin: true,
          permissions: ['read:all', 'read:contributor_emails', 'manage:db']
        }
      });
    }

    let cleanUrl = schoolUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // 1. Authenticate against Arbor API
    const loginUrl = `${cleanUrl}/auth/login?lang=en`;
    const loginResp = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${cleanUrl}/?/home-ui/index`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({ items: [{ username: cleanUser, password }] })
    });

    const setCookies = loginResp.headers.raw()['set-cookie'] || [];
    const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
    const loginData = await loginResp.json().catch(() => ({}));

    if (!loginData.success && !cookieHeader.includes('mis') && !cookieHeader.includes('arbor_session')) {
      return res.status(401).json({
        error: loginData.errors?.[0]?.message || 'Invalid username or password. Please check your credentials.'
      });
    }

    // 2. Fetch User Settings & Determine User Type
    const settingsResp = await fetch(`${cleanUrl}/auth/current-user-settings/format/json`, {
      headers: {
        'Cookie': cookieHeader,
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    const settingsData = settingsResp.ok ? await settingsResp.json() : {};
    const userProfile = settingsData.items?.[0] || {};
    const userType = userProfile.user_type || (cleanUser.toLowerCase().endsWith('@wrennschool.org.uk') ? 'student' : 'guardian');
    const displayName = userProfile.display_name || cleanUser.split('@')[0].toUpperCase();

    // 3. Resolve Student ID
    let studentId = 10433; // Default known Wrenn student ID
    if (userProfile.calendarUrl) {
      const match = userProfile.calendarUrl.match(/student-id\/(\d+)/);
      if (match) studentId = parseInt(match[1], 10);
    }

    // If Guardian, discover student ID from Dashboard layout
    if (userType === 'guardian') {
      try {
        const dashRes = await fetch(`${cleanUrl}/guardians/home-ui/dashboard`, {
          headers: {
            'Cookie': cookieHeader,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        });
        if (dashRes.ok) {
          const dashText = await dashRes.text();
          const match = dashText.match(/student-id[\/\\"]+(\d+)/i) || dashText.match(/overview\/id\/(\d+)/i);
          if (match) studentId = parseInt(match[1], 10);
        }
      } catch (e) {
        console.warn('[AUTH] Guardian student discovery note:', e.message);
      }
    }

    console.log(`[AUTH] User "${displayName}" (${userType}) logged in. Student ID: ${studentId}`);

    // 4. Scrape Timetable & Extract Free Study Rooms
    const discoveredStudyRooms = await scrapeTimetableForUser(cleanUrl, cookieHeader, userType, studentId, cleanUser);

    res.json({
      success: true,
      message: `Logged in as ${displayName}. Ingested ${discoveredStudyRooms.length} study room slots into MongoDB Atlas.`,
      user: {
        username: cleanUser,
        displayName,
        userType,
        studentId,
        roomsSynced: discoveredStudyRooms.length
      }
    });
  } catch (error) {
    console.error('[AUTH ERROR]:', error);
    res.status(500).json({ error: error.message });
  }
});

// Universal Scraper for Student or Guardian
async function scrapeTimetableForUser(cleanUrl, cookieHeader, userType, studentId, userEmail) {
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const properDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const now = new Date();
  const thisMonday = getMonday(now);
  const nextMonday = addDays(thisMonday, 7);

  const week1Type = getCurrentSchoolWeek(thisMonday);
  const week2Type = week1Type === 'A' ? 'B' : 'A';

  const weeks = [
    { type: week1Type, monday: thisMonday },
    { type: week2Type, monday: nextMonday }
  ];

  const ingestedDocs = [];

  for (const wk of weeks) {
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const targetDate = addDays(wk.monday, dayOffset);
      const dateStr = formatDateISO(targetDate);
      const daySlug = dayNames[dayOffset];
      const dayNum = dayOffset + 1;

      // Use Guardian or Student widget endpoint
      const widgetUrl = userType === 'guardian'
        ? `${cleanUrl}/guardians/widget-data/get-calendar-data/student-id/${studentId}/date/${dateStr}`
        : `${cleanUrl}/students/widget-data/get-calendar-data/student-id/${studentId}/date/${dateStr}`;

      try {
        const wRes = await fetch(widgetUrl, {
          headers: {
            'Cookie': cookieHeader,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        });

        if (wRes.ok) {
          const wData = await wRes.json().catch(() => ({}));
          const items = wData.items || [];

          for (const item of items) {
            const fields = item.fields || {};
            const rawRoom = fields.location?.value || '';
            const subject = fields.title?.value || '';
            const start = fields.start_datetime?.value ? fields.start_datetime.value.split(' ')[1].substring(0, 5) : '';

            const cleanCode = cleanRoomCode(rawRoom);
            const period = matchTimeToPeriod(start);

            if (period && cleanCode && isStudySubject(subject, cleanCode)) {
              const doc = {
                weekType: wk.type,
                day: daySlug,
                dayNumber: dayNum,
                dayName: properDayNames[dayOffset],
                lesson: period.number,
                periodId: period.id,
                roomCode: cleanCode,
                subject: subject || '6th Form Study',
                supervisor: 'Study Supervisor',
                isManual: false,
                updatedAt: new Date()
              };

              if (isAtlasConnected) {
                // Non-destructive upsert: Adds user email to contributedByEmails array without duplicating
                await FreeRoom.findOneAndUpdate(
                  { weekType: wk.type, day: daySlug, lesson: period.number, roomCode: cleanCode },
                  {
                    $set: doc,
                    $setOnInsert: { createdAt: new Date() },
                    $addToSet: { contributedByEmails: userEmail.toLowerCase().trim() }
                  },
                  { upsert: true, new: true }
                );
              }
              ingestedDocs.push(doc);
            }
          }
        }
      } catch (err) {
        console.warn(`[SCRAPER] Date pull notice for ${dateStr}:`, err.message);
      }
    }
  }

  // Also query multiday calendar grid to capture any extra schedule entries
  try {
    for (const wk of weeks) {
      const startStr = formatDateISO(wk.monday);
      const endStr = formatDateISO(addDays(wk.monday, 4));

      const calRes = await fetch(`${cleanUrl}/calendar-entry/list-static/format/json/`, {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          action_params: {
            view: 'multiday',
            startDate: startStr,
            endDate: endStr,
            filters: [{ field_name: 'object', value: { _objectTypeId: 1, _objectId: studentId } }]
          }
        })
      });

      if (calRes.ok) {
        const calData = await calRes.json().catch(() => ({}));
        const pages = calData.items?.[0]?.fields?.response?.value?.pages || [];

        for (const page of pages) {
          if (!page.html) continue;
          const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
          const eventRegex = /<div[^>]*class=["'][^"']*mis-cal-event[^"']*["'][^>]*data-eventid=["']([^"']*)["'][^>]*>([\s\S]*?)<\/div>/gi;
          const timeRegex = /class=["'][^"']*mis-cal-event-time[^"']*["']>([^<]+)</i;
          const titleRegex = /<b[^>]*class=["']title["'][^>]*>([^<]+)<\/b>/i;

          const cells = Array.from(page.html.matchAll(cellRegex));
          for (let cIdx = 1; cIdx < Math.min(6, cells.length); cIdx++) {
            const dayOffset = cIdx - 1;
            const daySlug = dayNames[dayOffset];
            const dNum = dayOffset + 1;
            const cellEvents = Array.from(cells[cIdx][1].matchAll(eventRegex));

            for (const ev of cellEvents) {
              const evId = ev[1];
              const evHtml = ev[2];
              const tMatch = evHtml.match(timeRegex);
              const titMatch = evHtml.match(titleRegex);

              if (tMatch && titMatch) {
                const startTime = tMatch[1].trim().split(/\s*-\s*/)[0];
                const subject = titMatch[1].trim();
                const period = matchTimeToPeriod(startTime);

                if (period && isStudySubject(subject, '')) {
                  // Fetch Tooltip for exact Room & Supervisor
                  let roomCode = '';
                  let staffName = 'Study Supervisor';
                  const tooltipUrl = userType === 'guardian'
                    ? `${cleanUrl}/guardians/calendar-entry/tooltip/id/${evId}`
                    : `${cleanUrl}/students/calendar-entry/tooltip/id/${evId}`;

                  try {
                    const ttRes = await fetch(tooltipUrl, {
                      headers: { 'Cookie': cookieHeader, 'X-Requested-With': 'XMLHttpRequest' }
                    });
                    if (ttRes.ok) {
                      const ttHtml = await ttRes.text();
                      const locM = ttHtml.match(/<b>Location<\/b>:<span>(.*?)<\/span>/i);
                      const stM = ttHtml.match(/<b>Staff<\/b>:<span>(.*?)<\/span>/i);
                      if (locM) roomCode = locM[1].trim();
                      if (stM) staffName = stM[1].trim();
                    }
                  } catch {}

                  const clean = cleanRoomCode(roomCode || subject);
                  if (clean) {
                    const doc = {
                      weekType: wk.type,
                      day: daySlug,
                      dayNumber: dNum,
                      dayName: properDayNames[dayOffset],
                      lesson: period.number,
                      periodId: period.id,
                      roomCode: clean,
                      subject: subject || '6th Form Study',
                      supervisor: staffName,
                      isManual: false,
                      updatedAt: new Date()
                    };

                    if (isAtlasConnected) {
                      await FreeRoom.findOneAndUpdate(
                        { weekType: wk.type, day: daySlug, lesson: period.number, roomCode: clean },
                        {
                          $set: doc,
                          $setOnInsert: { createdAt: new Date() },
                          $addToSet: { contributedByEmails: userEmail.toLowerCase().trim() }
                        },
                        { upsert: true, new: true }
                      );
                    }
                    ingestedDocs.push(doc);
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[SCRAPER] Multiday calendar scraper note:', err.message);
  }

  return ingestedDocs;
}

// ==========================================
// 6. Admin Endpoints (Hardcoded credentials: localhost@localhost / localhost)
// ==========================================
app.all(['/api/admin/db', '/api/admin/debug'], async (req, res) => {
  try {
    const adminPass = req.headers['x-admin-password'] || req.query.password || req.body?.password;
    const adminUser = req.headers['x-admin-user'] || req.query.username || req.body?.username;

    if (adminUser !== 'localhost@localhost' || adminPass !== 'localhost') {
      return res.status(403).json({ error: 'Unauthorized: Admin credentials required' });
    }

    if (!isAtlasConnected) {
      return res.status(503).json({ error: 'MongoDB Atlas is not connected' });
    }

    const records = await FreeRoom.find({}).sort({ weekType: 1, dayNumber: 1, lesson: 1 }).lean();

    res.json({
      success: true,
      count: records.length,
      timestamp: new Date().toISOString(),
      rooms: records
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Manual Room Addition: /api/rooms/manual
app.post('/api/rooms/manual', async (req, res) => {
  try {
    const { roomCode, weekType, week: altWeek, dayOfWeek = 1, periodId = 'p1', notes, userEmail } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const clean = cleanRoomCode(roomCode);
    if (!clean) {
      return res.status(400).json({ error: 'Valid alphanumeric room code is required' });
    }

    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const properDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dNum = Math.max(1, Math.min(5, Number(dayOfWeek) || 1));
    const daySlug = dayNames[dNum - 1];
    const lesson = periodId ? parseInt(String(periodId).replace(/[^0-9]/g, ''), 10) || 1 : 1;
    const rawWeek = weekType || altWeek || 'A';
    const week = String(rawWeek).toUpperCase() === 'B' ? 'B' : 'A';
    const submitterEmail = String(userEmail || 'student@wrennschool.org.uk').toLowerCase().trim();

    const doc = {
      weekType: week,
      day: daySlug,
      dayNumber: dNum,
      dayName: properDayNames[dNum - 1],
      lesson,
      periodId: `p${lesson}`,
      roomCode: clean,
      subject: 'Free Study Room (Student Submission)',
      supervisor: 'Study Supervisor',
      createdByEmail: submitterEmail,
      isManual: true,
      notes: notes || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isAtlasConnected) {
      await FreeRoom.findOneAndUpdate(
        { weekType: week, day: daySlug, lesson, roomCode: clean },
        {
          $set: doc,
          $addToSet: { contributedByEmails: submitterEmail }
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: `Room ${clean} added to MongoDB Atlas for Week ${week} ${properDayNames[dNum - 1]} Period ${lesson}`,
      room: toPublicRoom(doc, submitterEmail)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE Room: /api/rooms/manual/:id (1-Hour Expiration & Ownership Enforced)
app.delete(['/api/rooms/manual/:id', '/api/rooms/:id', '/api/rooms/manual'], async (req, res) => {
  try {
    const roomId = req.params.id || req.query.id;
    const reqEmail = String(req.query.userEmail || req.headers['x-user-email'] || req.body?.userEmail || '').toLowerCase().trim();

    if (!isAtlasConnected) {
      return res.status(503).json({ error: 'MongoDB Atlas is not connected' });
    }

    const isAdmin = reqEmail === 'localhost@localhost';

    // Locate the document first to check permissions and time limit
    let query = {};
    if (roomId) {
      const parts = roomId.split('-');
      if (parts.length >= 5 && parts[0] === 'room') {
        const weekType = parts[1].toUpperCase();
        const dayNum = Number(parts[2]);
        const lesson = parseInt(parts[3].replace(/[^0-9]/g, ''), 10);
        const roomCode = cleanRoomCode(parts.slice(4).join('-'));
        query = { weekType, dayNumber: dayNum, lesson, roomCode };
      } else {
        query = { $or: [{ id: roomId }, { roomCode: cleanRoomCode(roomId) }] };
      }
    } else {
      const { weekType, dayOfWeek, periodId, roomCode } = req.query;
      const clean = cleanRoomCode(roomCode);
      if (clean) query.roomCode = clean;
      if (weekType) query.weekType = String(weekType).toUpperCase();
      if (dayOfWeek) query.dayNumber = Number(dayOfWeek);
      if (periodId) query.lesson = parseInt(String(periodId).replace(/[^0-9]/g, ''), 10);
    }

    const targetRoom = await FreeRoom.findOne(query);
    if (!targetRoom) {
      return res.status(404).json({ error: 'Room not found in database' });
    }

    // Permission Enforcement
    if (!isAdmin) {
      if (!targetRoom.isManual) {
        return res.status(403).json({
          error: 'Forbidden: Only administrator (localhost) can delete official Arbor timetable rooms.'
        });
      }

      const isOwner = reqEmail && (
        (targetRoom.createdByEmail && targetRoom.createdByEmail.toLowerCase() === reqEmail) ||
        (Array.isArray(targetRoom.contributedByEmails) && targetRoom.contributedByEmails.includes(reqEmail))
      );

      if (!isOwner) {
        return res.status(403).json({
          error: 'Forbidden: You can only delete manual room submissions that you personally submitted.'
        });
      }

      const createdAtTime = targetRoom.createdAt ? new Date(targetRoom.createdAt).getTime() : 0;
      const ageMs = Date.now() - createdAtTime;
      const ONE_HOUR_MS = 60 * 60 * 1000;

      if (ageMs > ONE_HOUR_MS) {
        return res.status(403).json({
          error: 'Deletion locked: The 1-hour student deletion window for this room has expired. Only administrator (localhost) can delete it.'
        });
      }
    }

    await FreeRoom.deleteOne({ _id: targetRoom._id });

    res.json({
      success: true,
      message: `Room ${targetRoom.roomCode} successfully deleted from MongoDB Atlas`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. Keep-Alive Self-Ping Engine (Prevents Render Sleep)
// ==========================================
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL || 'https://freeroom-server.onrender.com';

function startKeepAlive() {
  console.log(`[KEEP-ALIVE] Initialized self-ping every 10m targeting: ${SELF_URL}`);
  setInterval(async () => {
    try {
      const res = await fetch(`${SELF_URL}/api/health`);
      if (res.ok) {
        console.log(`[KEEP-ALIVE] Heartbeat ping successful at ${new Date().toLocaleTimeString()} (status: ${res.status})`);
      }
    } catch (err) {
      console.warn(`[KEEP-ALIVE] Ping notice:`, err.message);
    }
  }, KEEP_ALIVE_INTERVAL);
}

// Root page
app.get('/', (req, res) => {
  const dbStatus = isAtlasConnected ? 'MongoDB Atlas (Connected)' : 'MongoDB Atlas (Connecting...)';
  res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:30px;background:#f6f8f7;"><h2>FreeRooms School API Server</h2><p>Status: <strong>Online</strong> | Database: <strong>${dbStatus}</strong></p><p><a href="/api/health">GET /api/health</a> | <a href="/api/weekA">GET /api/weekA</a> | <a href="/api/weekB/monday/lesson1">GET /api/weekB/monday/lesson1</a></p></body></html>`);
});

app.listen(PORT, () => {
  console.log(`FreeRooms Backend API running on port ${PORT}`);
  startKeepAlive();
});
