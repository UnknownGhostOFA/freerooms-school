require('dotenv').config();
const dns = require('dns');

// Configure reliable public DNS servers to resolve MongoDB SRV records across all networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback to system DNS if custom servers fail
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

// MongoDB Mongoose Schema
const FreeRoomSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  roomCode: { type: String, required: true },
  weekType: { type: String, enum: ['A', 'B'], required: true },
  dayOfWeek: { type: Number, required: true }, // 1=Mon .. 5=Fri
  dayName: { type: String, required: true },
  periodId: { type: String, required: true },
  periodNumber: { type: Number, required: true },
  lessonSubject: { type: String, default: 'Free Study Room (Reported by Student)' },
  supervisor: { type: String },
  contributedBy: { type: String, default: 'Student Submission' },
  isManual: { type: Boolean, default: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const FreeRoom = mongoose.models.FreeRoom || mongoose.model('FreeRoom', FreeRoomSchema);

let isAtlasConnected = false;

// Connect to MongoDB Atlas
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
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

// Root Webpage for Render Server
app.get('/', (req, res) => {
  const dbStatus = isAtlasConnected ? 'MongoDB Atlas (Connected)' : 'MongoDB Atlas (Connecting...)';
  const dbColor = isAtlasConnected ? '#10b981' : '#f59e0b';

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreeRooms School — API Server</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --arbor-green: #005047;
      --arbor-dark: #003630;
      --arbor-mint: #e3f5ec;
      --arbor-accent: #00875f;
      --bg: #f6f8f7;
      --card-bg: #ffffff;
      --text-main: #141b1f;
      --text-muted: #5e6d77;
      --border: #dbe4df;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container {
      width: 100%;
      max-width: 540px;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 54, 48, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, var(--arbor-green) 0%, var(--arbor-dark) 100%);
      padding: 32px 28px;
      color: #ffffff;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #34d399;
      border-radius: 50%;
      box-shadow: 0 0 10px #34d399;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }
    p.subtitle {
      font-size: 13px;
      opacity: 0.85;
      font-weight: 500;
    }
    .content {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .status-card {
      background: #fcfdfd;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
    }
    .status-label {
      color: var(--text-muted);
      font-weight: 600;
    }
    .status-val {
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      background: var(--arbor-green);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 20px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(0, 80, 71, 0.25);
    }
    .btn-primary:hover {
      background: var(--arbor-accent);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 80, 71, 0.35);
    }
    .btn-primary:active {
      transform: translateY(0);
    }
    .endpoints {
      font-size: 12px;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .endpoint-link {
      color: var(--arbor-green);
      text-decoration: none;
      font-weight: 600;
      font-family: monospace;
      padding: 6px 10px;
      background: var(--arbor-mint);
      border-radius: 8px;
      display: inline-block;
    }
    .endpoint-link:hover {
      text-decoration: underline;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: var(--text-muted);
      padding: 14px 28px 24px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">
        <span class="pulse-dot"></span>
        API Engine Active
      </div>
      <h1>FreeRooms School Server</h1>
      <p class="subtitle">Wrenn School Timetable & Crowdsourced Study Rooms</p>
    </div>

    <div class="content">
      <div class="status-card">
        <div class="status-row">
          <span class="status-label">Server Status</span>
          <span class="status-val" style="color: #00875f;">● Online & Healthy</span>
        </div>
        <div class="status-row">
          <span class="status-label">Database</span>
          <span class="status-val" style="color: ${dbColor};">${dbStatus}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Keep-Alive Heartbeat</span>
          <span class="status-val" style="color: #00875f;">● Every 10 mins (Active)</span>
        </div>
      </div>

      <a href="http://freeroom-frontend.vercel.app/" class="btn-primary" target="_blank" rel="noopener noreferrer">
        <span>Open FreeRooms App</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </a>

      <div class="endpoints">
        <span><strong>Quick API Endpoints:</strong></span>
        <div><a class="endpoint-link" href="/api/health">GET /api/health</a> &nbsp; <a class="endpoint-link" href="/api/matrix?week=A">GET /api/matrix?week=A</a></div>
      </div>
    </div>

    <div class="footer">
      Independent student utility. Not affiliated with, endorsed by, or officially associated with Wrenn School or Arbor Education / The Key Group.
    </div>
  </div>
</body>
</html>
  `);
});

// GET Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'MongoDB Atlas',
    connected: isAtlasConnected,
    keepAlive: 'active (10m)',
    timestamp: new Date().toISOString()
  });
});

// GET Matrix
app.get('/api/matrix', async (req, res) => {
  try {
    const week = (req.query.week || 'A').toUpperCase();

    // 1. Load all study rooms for this week from MongoDB Atlas
    let mongoRooms = [];
    if (isAtlasConnected) {
      const records = await FreeRoom.find({ weekType: week }).lean();
      mongoRooms = records.map(r => ({
        id: r.id || `atlas-${Date.now()}-${r.roomCode}`,
        roomCode: cleanRoomCode(r.roomCode),
        weekType: r.weekType,
        dayOfWeek: r.dayOfWeek,
        dayName: r.dayName,
        periodId: r.periodId,
        periodNumber: r.periodNumber,
        lessonSubject: r.lessonSubject || 'Free Study Room',
        supervisor: r.supervisor,
        contributedBy: r.contributedBy || 'Arbor Sync',
        isManual: !!r.isManual,
        notes: r.notes,
        createdAt: r.createdAt
      }));
    }

    // 2. Load baseline live scraped weeks
    let liveWeeksPath = path.join(__dirname, 'arbor-live-weeks.json');
    if (!fs.existsSync(liveWeeksPath)) {
      liveWeeksPath = path.join(__dirname, '..', 'frontend', 'arbor-live-weeks.json');
    }

    let baselineRooms = [];
    if (fs.existsSync(liveWeeksPath)) {
      const raw = JSON.parse(fs.readFileSync(liveWeeksPath, 'utf-8'));
      const weekEvents = week === 'B' ? raw.weekB : raw.weekA;

      let dayIdx = -1;
      baselineRooms = (weekEvents || [])
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

    // Deduplicate by roomCode + dayOfWeek + periodId
    const roomMap = new Map();

    // Baseline rooms first
    for (const r of baselineRooms) {
      if (!r.roomCode) continue;
      const key = `${r.roomCode}-${r.dayOfWeek}-${r.periodId}`;
      roomMap.set(key, r);
    }

    // MongoDB Atlas rooms (from student logins & manual contributions) take top priority & augment
    for (const r of mongoRooms) {
      if (!r.roomCode) continue;
      const key = `${r.roomCode}-${r.dayOfWeek}-${r.periodId}`;
      roomMap.set(key, r);
    }

    const allRooms = Array.from(roomMap.values());

    res.json({
      success: true,
      week,
      source: 'mongodb_atlas',
      count: allRooms.length,
      mongoCount: mongoRooms.length,
      studyRooms: allRooms
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Batch Sync (from student logins)
app.post('/api/rooms/sync-batch', async (req, res) => {
  try {
    const { rooms, studentName } = req.body;
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({ error: 'Array of study rooms is required' });
    }

    const saved = [];
    for (const r of rooms) {
      const clean = cleanRoomCode(r.roomCode);
      if (!clean) continue;

      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayNum = Number(r.dayOfWeek) || 1;
      const dayName = r.dayName || dayNames[dayNum - 1] || 'Monday';
      const periodId = r.periodId || 'p1';
      const periodNumber = r.periodNumber ?? (parseInt(periodId.replace('p', ''), 10) || 1);
      const week = (r.weekType || 'A').toUpperCase();

      const uniqueId = r.id || `sync-${week}-${dayNum}-${periodId}-${clean}`;

      const doc = {
        id: uniqueId,
        roomCode: clean,
        weekType: week,
        dayOfWeek: dayNum,
        dayName,
        periodId,
        periodNumber,
        lessonSubject: r.lessonSubject || '6th form study',
        supervisor: r.supervisor || 'Study Supervisor',
        contributedBy: r.contributedBy || (studentName ? `${studentName} (Arbor Sync)` : 'Student Submission'),
        isManual: !!r.isManual,
        notes: r.notes || undefined,
        createdAt: new Date()
      };

      if (isAtlasConnected) {
        await FreeRoom.findOneAndUpdate({ id: uniqueId }, doc, { upsert: true, new: true });
      }
      saved.push(doc);
    }

    res.json({
      success: true,
      message: `Synced ${saved.length} study rooms to MongoDB Atlas`,
      count: saved.length,
      rooms: saved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Manual Room
app.post('/api/rooms/manual', async (req, res) => {
  try {
    const { id, roomCode, weekType, dayOfWeek, periodId, notes, contributedBy } = req.body;
    if (!roomCode) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const clean = cleanRoomCode(roomCode);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayName = dayNames[(dayOfWeek || 1) - 1] || 'Monday';
    const periodNumber = periodId ? parseInt(periodId.replace('p', ''), 10) || 1 : 1;
    const roomId = id || `manual-${weekType || 'A'}-${Date.now()}-${clean}`;

    const newRoom = {
      id: roomId,
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
      createdAt: new Date()
    };

    // Save exclusively to MongoDB Atlas
    if (isAtlasConnected) {
      await FreeRoom.findOneAndUpdate({ id: roomId }, newRoom, { upsert: true, new: true });
    } else {
      console.warn('[WARN] MongoDB Atlas not connected. Room could not be saved to DB.');
    }

    res.json({
      success: true,
      message: `Room ${clean} saved to MongoDB Atlas for Week ${weekType || 'A'} Period ${periodNumber}`,
      room: newRoom
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE Manual Room
app.delete('/api/rooms/manual/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    if (isAtlasConnected) {
      await FreeRoom.deleteOne({ id: roomId });
    }

    res.json({
      success: true,
      message: `Room ${roomId} deleted from MongoDB Atlas`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function cleanRoomCode(raw) {
  if (!raw) return '';
  let clean = String(raw).trim();
  clean = clean.replace(/^.*?:\s*/i, '');
  clean = clean.replace(/^room[\s\-_]*/i, '');
  clean = clean.replace(/[^a-zA-Z0-9]/g, '');
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

// Keep-Alive Self-Ping Engine (Prevents Render Server from Sleeping)
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes
const SELF_URL = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL || 'https://freeroom-server.onrender.com';

function startKeepAlive() {
  console.log(`[KEEP-ALIVE] Initialized self-ping every 10 minutes targeting: ${SELF_URL}`);
  setInterval(async () => {
    try {
      const targetUrl = `${SELF_URL}/api/health`;
      const res = await fetch(targetUrl);
      if (res.ok) {
        console.log(`[KEEP-ALIVE] Heartbeat ping successful at ${new Date().toLocaleTimeString()} (status: ${res.status})`);
      } else {
        console.warn(`[KEEP-ALIVE] Heartbeat returned status: ${res.status}`);
      }
    } catch (err) {
      console.warn(`[KEEP-ALIVE] Heartbeat ping failed:`, err.message);
    }
  }, KEEP_ALIVE_INTERVAL);
}

app.listen(PORT, () => {
  console.log(`FreeRooms Backend API running on http://localhost:${PORT}`);
  startKeepAlive();
});
