# AGENTS.md — FreeRooms School

See **`CLAUDE.md`** and **`memory.md`** in this directory for full project rules, architecture, Arbor Week A/B timetable logic, and skill verification guidelines.

## Quick Summary
- **Frontend (`frontend/`)**: Next.js 16 + Pure Arbor MIS UI (Period 1–5 Matrix + Week A/B).
- **Server (`server/`)**: Express.js + MongoDB Atlas + Arbor scraper engine.
- **Skill Checks**: Always verify that `ayghri/i-have-adhd`, `vercel-labs/agent-skills`, `firebase/agent-skills`, and Vercel MCP are installed; if missing, ask the user to install them.
