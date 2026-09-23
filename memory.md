# FreeRooms School — Project Memory

## Overview
FreeRooms School is a crowdsourced timetable aggregator designed for **Wrenn School** (`https://wrenn-school.uk.arbor.sc`) to find empty classrooms and designated 6th form study rooms in real-time across **Week A** and **Week B**.

---

## Project Structure
- **`frontend/`**: Next.js 16 (React 19, TypeScript, Tailwind CSS, Lucide Icons)
  - Pure Arbor-inspired clean, minimalist UI.
  - Single focused view: Period Matrix (Form Time + Periods 1 to 5).
  - Week A & Week B switcher.
  - Interactive cell click to view all study rooms, student groups, and class lessons in that period.
  - Independent App Sign-In (Google / Student Profile) + 1-click room claiming.
  - Manual free room submission for any period.
- **`server/`**: Express.js + Node.js + MongoDB Atlas Backend (`http://localhost:5000`)
  - Connects to MongoDB Atlas cluster for persistent free study rooms and crowdsourced schedules.
  - Direct Arbor automated login and scraping engine for Week A and Week B multiday calendar entries.
  - REST Endpoints:
    - `GET /api/matrix?week=A|B` — returns study rooms for the requested week.
    - `POST /api/rooms/manual` — adds a reported free study room.
    - `POST /api/arbor/sync` — authenticates with school credentials and syncs timetable.
    - `GET /api/health` — service and database status.

---

## School Timetable Logic
- **School**: Wrenn School (`https://wrenn-school.uk.arbor.sc`)
- **Periods**:
  - `Form Time`: 08:40 – 09:10
  - `Period 1`: 09:10 – 10:10
  - `Period 2`: 10:10 – 11:10
  - `Period 3`: 11:30 – 12:30
  - `Period 4`: 12:30 – 13:30
  - `Period 5`: 14:10 – 15:10
- **Study Lessons = Free Rooms**: Any class titled `6th form study` (e.g. `13D/St2`, `13A/St2`, `13H/St2`, `12B/St1`, etc.) is registered as an available free study room (such as `6B`, `6D`, `6E`, `6F`, `6`, `7`, `22`).
- **Two-Week Cycle**: Rotating **Week A** and **Week B** schedules with distinct periods and study locations.

---

## Credentials & Security (Do Not Commit)
- **MongoDB Atlas**: Configured in `server/.env` via `atlas-credentials.env`.
- **Git Ignore**: Root `.gitignore`, `frontend/.gitignore`, and `server/.gitignore` exclude `.env`, `node_modules`, `.next`, and personal credentials.
- **GitHub Target**: `UnknownGhostOFA/freerooms-school`.
