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

// Local Database File Fallback
const DATA_DIR = path.join(__dirname, 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'crowdsource-db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getLocalData() {
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    return { studyRooms: [], manualOverrides: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
  } catch {
    return { studyRooms: [], manualOverrides: [] };
  }
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn('Failed to save local data:', err.message);
  }
}

// MongoDB Mongoose Schema
const FreeRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true },
  weekType: { type: String, enum: ['A', 'B'], required: true },
  dayOfWeek: { type: Number, required: true }, // 1=Mon .. 5=Fri
  dayName: { type: String, required: true },
  periodId: { type: String, required: true },
  periodNumber: { type: Number, required: true },
  lessonSubject: { type: String, default: '6th form study' },
  supervisor: { type: String },
  contributedBy: { type: String, default: 'Arbor' },
  isManual: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const FreeRoom = mongoose.models.FreeRoom || mongoose.model('FreeRoom', FreeRoomSchema);

let isAtlasConnected = false;

// Attempt Atlas Connection with timeout
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 4000,
    tlsAllowInvalidCertificates: true
  })
  .then(() => {
    isAtlasConnected = true;
    console.log('[PASS] MongoDB Atlas Connected.');
  })
  .catch(() => {
    console.log('[INFO] MongoDB Atlas port 27017 filtered by network. Using Local JSON Database Engine.');
  });
}

// GET Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: isAtlasConnected ? 'MongoDB Atlas' : 'Local Persistent Engine',
    timestamp: new Date().toISOString()
  });
});

// GET Matrix
app.get('/api/matrix', async (req, res) => {
  try {
    const week = (req.query.week || 'A').toUpperCase();
    let rooms = [];

    if (isAtlasConnected) {
      rooms = await FreeRoom.find({ weekType: week }).sort({ periodNumber: 1 });
    } else {
      const localData = getLocalData();
      const localManual = (localData.studyRooms || []).filter(r => r.weekType === week);

      // Load baseline live scraped weeks
      const liveWeeksPath = path.join(__dirname, '..', 'frontend', 'arbor-live-weeks.json');
      let baselineRooms = [];
      if (fs.existsSync(liveWeeksPath)) {
        const raw = JSON.parse(fs.readFileSync(liveWeeksPath, 'utf-8'));
        const weekEvents = week === 'B' ? raw.weekB : raw.weekA;
        
        let dayIdx = -1;
        baselineRooms = weekEvents
          .filter(e => {
            if (e.start === '08:40') dayIdx++;
            return e.isStudy;
          })
          .map((e, idx) => ({
            id: `arbor-${week}-${idx}`,
            roomCode: cleanRoomCode(e.room),
            weekType: week,
            dayOfWeek: Math.max(1, Math.min(5, dayIdx + 1)),
            dayName: e.dayName,
            periodId: matchTimeToPeriod(e.start).id,
            periodNumber: matchTimeToPeriod(e.start).number,
            lessonSubject: e.subject,
            supervisor: e.teacher || 'Study Supervisor',
            contributedBy: `Arbor (Week ${week})`,
            isManual: false
          }));
      }

      rooms = [...localManual, ...baselineRooms];
    }

    res.json({
      success: true,
      week,
      source: isAtlasConnected ? 'atlas' : 'local_db',
      count: rooms.length,
      studyRooms: rooms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Manual Room
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

    const newRoom = {
      id: `manual-${Date.now()}-${clean}`,
      roomCode: clean,
      weekType: (weekType || 'A').toUpperCase(),
      dayOfWeek: dayOfWeek || 1,
      dayName,
      periodId: periodId || 'p1',
      periodNumber,
      lessonSubject: 'Free Study Room (Reported by Student)',
      contributedBy: contributedBy || 'Student Submission',
      isManual: true,
      notes: notes || undefined,
      createdAt: new Date().toISOString()
    };

    if (isAtlasConnected) {
      await FreeRoom.create(newRoom);
    } else {
      const data = getLocalData();
      data.studyRooms = [newRoom, ...(data.studyRooms || [])];
      saveLocalData(data);
    }

    res.json({
      success: true,
      message: `Room ${clean} added to Week ${weekType || 'A'} Period ${periodNumber}`,
      room: newRoom
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
  console.log(`FreeRooms Backend API running on http://localhost:${PORT}`);
});
