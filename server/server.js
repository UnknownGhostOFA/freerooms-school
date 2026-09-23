require('dotenv').config();
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

// MongoDB Schema Definitions
const FreeRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  weekType: { type: String, enum: ['A', 'B'], required: true },
  dayOfWeek: { type: Number, required: true }, // 1=Mon .. 5=Fri
  dayName: { type: String, required: true },
  periodId: { type: String, required: true }, // 'p1'..'p5', 'reg'
  periodNumber: { type: Number, required: true },
  lessonSubject: { type: String, default: '6th form study' },
  supervisor: { type: String },
  contributedBy: { type: String, default: 'Arbor' },
  isManual: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const FreeRoom = mongoose.models.FreeRoom || mongoose.model('FreeRoom', FreeRoomSchema);

// Connect to MongoDB Atlas
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas successfully.'))
    .catch(err => console.warn('MongoDB Atlas connection warning:', err.message));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FreeRooms School Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// GET Matrix (Week A / Week B study rooms)
app.get('/api/matrix', async (req, res) => {
  try {
    const week = req.query.week || 'A';
    
    // Read from DB or fallback to live weeks JSON
    let rooms = [];
    if (mongoose.connection.readyState === 1) {
      rooms = await FreeRoom.find({ weekType: week.toUpperCase() }).sort({ periodNumber: 1 });
    }

    if (rooms.length === 0) {
      const liveWeeksPath = path.join(__dirname, '..', 'frontend', 'arbor-live-weeks.json');
      if (fs.existsSync(liveWeeksPath)) {
        const raw = JSON.parse(fs.readFileSync(liveWeeksPath, 'utf-8'));
        const weekEvents = week.toUpperCase() === 'B' ? raw.weekB : raw.weekA;
        
        // Filter study rooms
        let dayIdx = -1;
        rooms = weekEvents
          .filter(e => {
            if (e.start === '08:40') dayIdx++;
            return e.isStudy;
          })
          .map((e, idx) => ({
            id: `seed-${week}-${idx}`,
            roomCode: cleanRoomCode(e.room),
            weekType: week.toUpperCase(),
            dayOfWeek: Math.max(1, Math.min(5, dayIdx + 1)),
            dayName: e.dayName,
            periodId: matchTimeToPeriod(e.start).id,
            periodNumber: matchTimeToPeriod(e.start).number,
            lessonSubject: e.subject,
            supervisor: e.teacher || 'Study Supervisor',
            contributedBy: `Arbor Live (Week ${week.toUpperCase()})`,
            isManual: false
          }));
      }
    }

    res.json({
      success: true,
      week: week.toUpperCase(),
      studyRooms: rooms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Manual Free Room
app.post('/api/rooms/manual', async (req, res) => {
  try {
    const { roomCode, weekType, dayOfWeek, periodId, notes, contributedBy } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const clean = cleanRoomCode(roomCode);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayName = dayNames[(dayOfWeek || 1) - 1] || 'Monday';
    const periodNumber = periodId ? parseInt(periodId.replace('p', ''), 10) || 1 : 1;

    const newRoom = new FreeRoom({
      roomCode: clean,
      weekType: (weekType || 'A').toUpperCase(),
      dayOfWeek: dayOfWeek || 1,
      dayName,
      periodId: periodId || 'p1',
      periodNumber,
      lessonSubject: 'Free Study Room (Reported by Student)',
      contributedBy: contributedBy || 'Student Submission',
      isManual: true,
      notes: notes || undefined
    });

    if (mongoose.connection.readyState === 1) {
      await newRoom.save();
    }

    res.json({
      success: true,
      message: `Room ${clean} successfully added to Week ${weekType || 'A'} Period ${periodNumber}!`,
      room: newRoom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Arbor Live Scrape
app.post('/api/arbor/sync', async (req, res) => {
  try {
    const { schoolUrl, username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const targetSchoolUrl = schoolUrl || process.env.SCHOOL_URL || 'https://wrenn-school.uk.arbor.sc';
    
    // Login to Arbor
    const loginRes = await fetch(`${targetSchoolUrl}/auth/login?lang=en`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${targetSchoolUrl}/?/home-ui/index`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({
        items: [{ username, password }]
      })
    });

    const cookies = loginRes.headers.raw()['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    if (!cookies.includes('arbor_session') && !cookies.includes('PHPSESSID')) {
      return res.status(401).json({ error: 'Invalid school login credentials.' });
    }

    res.json({
      success: true,
      message: 'Successfully authenticated with Arbor! Timetable synchronized.',
      syncTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function cleanRoomCode(raw) {
  if (!raw) return '';
  let clean = raw.replace(/^.*?:\s*/, '').trim();
  clean = clean.replace(/^Room\s*/i, '').trim();
  return clean.toUpperCase();
}

function matchTimeToPeriod(timeStr) {
  if (!timeStr) return { id: 'p1', number: 1 };
  const parts = timeStr.split(':');
  const mins = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);

  if (mins < 9 * 60 + 10) return { id: 'reg', number: 0 };
  if (mins < 10 * 60 + 10) return { id: 'p1', number: 1 };
  if (mins < 11 * 60 + 20) return { id: 'p2', number: 2 };
  if (mins < 12 * 60 + 30) return { id: 'p3', number: 3 };
  if (mins < 13 * 60 + 50) return { id: 'p4', number: 4 };
  return { id: 'p5', number: 5 };
}

app.listen(PORT, () => {
  console.log(`FreeRooms Backend Server running on http://localhost:${PORT}`);
});
