# CLAUDE.md — FreeRooms School Assistant Guide

Welcome to **FreeRooms School**! This document equips Claude Code and any AI agent with full context about this project, architecture, rules, and mandatory skill/MCP checks.

---

## 🚨 Mandatory Agent Skill & MCP Verification

Upon opening this repository or starting a conversation, you MUST verify that the following tools, skills, and MCP servers are present. **If any are missing, proactively ask the user to install them with the provided commands:**

### 1. Required Skills (Skills CLI: `npx skills`)
- **`ayghri/i-have-adhd`**: ADHD-optimized structured communication.
  - Install command: `npx skills add ayghri/i-have-adhd -g -y`
- **`vercel-labs/agent-skills`**: React best practices, UI composition, web design guidelines.
  - Install command: `npx skills add vercel-labs/agent-skills -g -y`
- **`firebase/agent-skills`**: Firebase & cloud backend skills.
  - Install command: `npx skills add firebase/agent-skills -g -y`
- **`minimalist-ui`**, **`frontend-design`**, **`frontend-ui-engineering`**: Premium editorial design & accessible UI patterns.

### 2. Configured MCP Servers (in `~/.config/opencode/opencode.json`)
- **`vercel`**: Remote OAuth (`https://mcp.vercel.com`)
- **`vercel-cli`**: Local CLI (`vercel-mcp-pro` with `VERCEL_TOKEN`)
- **`firecrawl`**: Remote web scraper (`https://mcp.firecrawl.dev/v2/mcp-oauth`)
- **`chrome-devtools`**: Local DevTools connector (`chrome-devtools-mcp`)
- **`magicuidesign-mcp`**: UI registry tools (`@magicuidesign/mcp`)

*If an MCP server or skill is missing from the environment, ask the user: "Would you like me to install [Skill / MCP name] for you now?"*

---

## 📁 Repository & Project Architecture

This workspace is split into two independent sub-projects:

### 1. `frontend/` (Next.js 16 Client App)
- **GitHub Repository**: [`UnknownGhostOFA/freeroom-frontend`](https://github.com/UnknownGhostOFA/freeroom-frontend)
- **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, `@vercel/analytics/next`.
- **Design System**: Exact **Arbor MIS** styling replica:
  - Theme colors: Arbor Dark Forest Green (`#005047`), Muted Mint (`#e3f5ec`), Border (`#dbe1dd`), Text (`#1b2129`).
  - Layout: Single focused **Period Matrix** (Form Time + Periods 1 to 5).
  - Navigation: Week A & Week B switcher, Monday – Friday tabs.
  - Interactive cell click opens period details with all free study rooms and classes.
  - 1-click room claiming ("Study Here") with confetti feedback.
  - Direct Arbor MIS School Sign-in (with "LOG IN USING ARBOR" separator).

### 2. `server/` (Node.js & Express API Backend)
- **GitHub Repository**: [`UnknownGhostOFA/freeroom-server`](https://github.com/UnknownGhostOFA/freeroom-server)
- **Port**: `http://localhost:5000`
- **Production URL**: `https://freeroom-server.onrender.com`
- **Framework**: Express.js, Mongoose, Node-fetch.
- **Database Architecture**:
  - **Exclusively MongoDB Atlas**: Live MongoDB Atlas cluster (`database.cv4cnz0.mongodb.net`, database `freerooms_school`).
  - **Self-Ping Heartbeat**: 10-minute automated ping engine preventing Render free-tier sleep.
  - **Landing Page**: Root `/` renders Arbor-styled health monitor with link to `http://freeroom-frontend.vercel.app/`.
- **Scraper Engine**: Connects to `https://wrenn-school.uk.arbor.sc`, extracts session cookies and student ID, and scrapes multiday calendar entries for Week A & Week B.

---

## 🏫 School Timetable & Free Room Logic

- **School**: Wrenn School (`https://wrenn-school.uk.arbor.sc`)
- **Period Timetable (Mon–Fri)**:
  - `Form Time`: 08:40 – 09:10
  - `Period 1`: 09:10 – 10:10
  - `Period 2`: 10:10 – 11:10
  - `Period 3`: 11:30 – 12:30
  - `Period 4`: 12:30 – 13:30
  - `Period 5`: 14:10 – 15:10
- **Study Lessons = Free Rooms**:
  - Any timetabled class with `6th form study` (e.g. `13D/St2`, `13A/St2`, `13H/St2`, `12B/St1`, etc.) indicates that the room is assigned as a **free study space** (such as `6B`, `6D`, `6E`, `6F`, `6`, `7`, `22`).
- **Two-Week Cycle**:
  - Rotates between **Week A** and **Week B** with distinct schedules.

---

## 🔒 Security & Disclaimers

- **Zero PII**: No personal student emails, real names, or passwords are committed to Git.
- **Protected Files**: `.env`, `*.env`, `atlas-credentials.env`, and `node_modules` are in `.gitignore`.
- **Mandatory Disclaimer**:
  *`"Disclaimer: Independent student utility. Not affiliated with, endorsed by, or officially associated with Wrenn School or Arbor Education / The Key Group."`*

---

## 🛠️ Common Commands

- **Run Frontend**: `cd frontend && npm run dev` (Runs on `http://localhost:3000`)
- **Run Server**: `cd server && npm run dev` (Runs on `http://localhost:5000`)
- **Build Frontend**: `cd frontend && npm run build`
- **Push Frontend**: `cd frontend && git push origin main`
- **Push Server**: `cd server && git push origin main`
