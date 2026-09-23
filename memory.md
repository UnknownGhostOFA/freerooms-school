# FreeRooms School — Project Memory

## Overview
FreeRooms School is a crowdsourced timetable aggregator designed for **Wrenn School** (`https://wrenn-school.uk.arbor.sc`) to find empty classrooms and designated 6th form study rooms in real-time across **Week A** and **Week B**.

---

## Architecture & Repositories

### 1. Frontend Client
- **GitHub Repository**: [`UnknownGhostOFA/freeroom-frontend`](https://github.com/UnknownGhostOFA/freeroom-frontend)
- **Local Directory**: `frontend/`
- **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Design Language**: Exact Arbor MIS replica (Arbor Green `#005047`, soft background `#f4f6f5`, clean `#dbe1dd` borders).
- **Core View**: Single focused **Period Matrix** (Form Time + Periods 1 to 5).
- **Features**:
  - Direct Arbor MIS School Sign-in (with "LOG IN USING ARBOR" separator).
  - Week A & Week B toggle.
  - Interactive period cell breakdown showing free study rooms and all classes.
  - 1-click room claiming ("I am studying here").
  - Manual free study room reporting.

### 2. Backend Server API
- **GitHub Repository**: [`UnknownGhostOFA/freeroom-server`](https://github.com/UnknownGhostOFA/freeroom-server)
- **Local Directory**: `server/` (Port 5000)
- **Tech Stack**: Node.js, Express.js, MongoDB Atlas (Mongoose), fallback local storage.
- **Database Architecture**:
  - **Layer 1**: Live MongoDB Atlas cluster connection.
  - **Layer 2**: Zero-config persistent JSON storage fallback (`server/data/crowdsource-db.json`) if port 27017 is blocked by local network.
- **Scraper Engine**: Direct internal Arbor API login, session cookie capture, student ID resolution, and multiday calendar scraper.

---

## School Timetable & Room Logic
- **School**: Wrenn School (`https://wrenn-school.uk.arbor.sc`)
- **Period Timings**:
  - `Form Time`: 08:40 – 09:10
  - `Period 1`: 09:10 – 10:10
  - `Period 2`: 10:10 – 11:10
  - `Period 3`: 11:30 – 12:30
  - `Period 4`: 12:30 – 13:30
  - `Period 5`: 14:10 – 15:10
- **Study Lessons = Free Rooms**: Any session titled `6th form study` (e.g. `13D/St2`, `13A/St2`, `13H/St2`, `12B/St1`) is extracted as an active free study room (such as `6B`, `6D`, `6E`, `6F`, `6`, `7`, `22`).
- **Two-Week Cycle**: Rotating **Week A** and **Week B** schedules.

---

## Disclaimers & Security
- **Disclaimer**: Independent student utility. Not affiliated with, endorsed by, or officially associated with Wrenn School or Arbor Education / The Key Group.
- **Credentials & Privacy**:
  - Zero personal emails or passwords stored in the repository.
  - All `.env`, `*.env`, and `node_modules` are strictly excluded in `.gitignore`.

---

## Installed Skills & MCP Servers
- **Installed Agent Skills**:
  - `ayghri/i-have-adhd`
  - `firebase/agent-skills`
  - `vercel-labs/agent-skills`
  - `minimalist-ui`, `frontend-design`, `frontend-ui-engineering`
- **MCP Servers Configured in `~/.config/opencode/opencode.json`**:
  - `vercel` (`https://mcp.vercel.com`)
  - `vercel-cli` (`vercel-mcp-pro`)
  - `firecrawl`
  - `chrome-devtools`
  - `magicuidesign-mcp`
