# Request Architecture: Frontend (Next.js) vs Backend Server (Express + MongoDB)

This document details the breakdown of responsibilities and route handling between the Next.js Frontend and the Express API Server.

---

## 1. High-Level Division of Responsibilities

```
[ User Browser ]
       │
       ├── (1) Page Navigations & UI Actions ──> [ Frontend: Next.js (Vercel) ]
       │                                                    │
       │                                                    ├── (A) Arbor Auth & Live Scraper Engine
       │                                                    │       (Direct HTTPS to Arbor MIS)
       │                                                    │
       │                                                    └── (B) Forward Synced Rooms & Matrix Queries
       │                                                                    │
       └────────────────────────────────────────────────────────────────────┼──────┐
                                                                            │      │
                                                                            ▼      ▼
                                                            [ Backend Server: Express.js (Render) ]
                                                                            │
                                                                            ▼
                                                                  [ MongoDB Atlas DB ]
```

---

## 2. Frontend Requests (Next.js 16 / Edge & Serverless)

**Location**: `frontend/src/app/api/`

The frontend acts as the **user-facing client, UI renderer, session coordinator, and Arbor scraper proxy**.

### Handled Routes:

1. **`POST /api/auth/arbor/login`** (`frontend/src/app/api/auth/arbor/login/route.ts`)
   - **Handles**: User authentication against Arbor MIS.
   - **Actions**:
     - Contacts `https://{schoolUrl}/auth/login?lang=en` with credentials.
     - Saves cookies and student ID in server memory.
     - Extracts initial timetable data from Arbor.
     - Automatically dispatches discovered study rooms to Backend `POST /api/rooms/sync-batch`.

2. **`GET /api/auth/arbor/status`** (`frontend/src/app/api/auth/arbor/status/route.ts`)
   - **Handles**: Checking whether the user's Arbor session is active, expired, or cached in memory.

3. **`POST /api/arbor/sync`** & **`POST /api/arbor/local-sync`** (`frontend/src/app/api/arbor/sync/route.ts`)
   - **Handles**: Live on-demand timetable sync requests using active session or provided cookies.

4. **`GET /api/rooms/manual`** (`frontend/src/app/api/rooms/manual/route.ts`)
   - **Handles**: Forwarding matrix room queries to Backend `GET /api/matrix?week={A|B}`.
   - **Fallback**: Returns empty/client fallback if the backend server is temporarily sleeping.

5. **`POST /api/rooms/manual`** & **`DELETE /api/rooms/manual`** (`frontend/src/app/api/rooms/manual/route.ts`)
   - **Handles**: Proxying student manual room additions and deletions to Backend Server.

6. **`POST /api/teams/sync`** (`frontend/src/app/api/teams/sync/route.ts`)
   - **Handles**: Microsoft Teams timetable synchronization.

---

## 3. Backend Server Requests (Express + MongoDB Atlas)

**Location**: `server/server.js`  
**Deployment**: Render (`https://freeroom-server.onrender.com` or `http://localhost:5000`)

The server acts as the **central database, persistence layer, crowdsource aggregator, and keep-alive daemon**.

### Handled Routes:

1. **`GET /api/matrix?week={A|B}`** (`server/server.js:311-402`)
   - **Handles**: Timetable matrix calculation for Week A or Week B.
   - **Actions**:
     - Fetches all study room records from MongoDB Atlas for the requested week.
     - Reads baseline dataset (`arbor-live-weeks.json`).
     - Merges and deduplicates on compound key: `${roomCode}-${dayOfWeek}-${periodId}`.
     - Returns combined list of free study rooms.

2. **`POST /api/rooms/sync-batch`** (`server/server.js:405-457`)
   - **Handles**: Bulk ingestion of study rooms scraped during student/parent logins.
   - **Actions**:
     - Sanitizes room codes (`cleanRoomCode`).
     - Performs atomic upserts: `FreeRoom.findOneAndUpdate({ id }, doc, { upsert: true })`.

3. **`POST /api/rooms/manual`** (`server/server.js:460-503`)
   - **Handles**: Manual student submissions of free rooms.
   - **Actions**:
     - Validates room code, day, period, and week.
     - Generates ID `manual-${weekType}-${timestamp}-${clean}` and saves to MongoDB Atlas.

4. **`DELETE /api/rooms/manual/:id`** (`server/server.js:506-524`)
   - **Handles**: Deleting a room record from MongoDB Atlas by its unique ID.

5. **`GET /api/health`** (`server/server.js:300-308`)
   - **Handles**: Server heartbeat and MongoDB Atlas connection status.

6. **Keep-Alive Engine** (`server/server.js:549-567`)
   - Internal 10-minute self-ping timer to prevent Render free-tier instances from idling.

---

## 4. Summary Matrix

| Operation | Handler | Destination |
| :--- | :--- | :--- |
| **User Login (Arbor)** | Next.js (`frontend`) | Arbor MIS (`https://{schoolUrl}/auth/login`) |
| **Timetable Scraping** | Next.js (`frontend`) | Arbor Calendar & Widget APIs |
| **Study Room Deduplication** | Express Server (`server`) | Memory Map + Baseline JSON |
| **Persistent Data Storage** | Express Server (`server`) | MongoDB Atlas (`FreeRoom` collection) |
| **Manual Room Add / Delete** | Next.js -> Express Server | MongoDB Atlas |
| **UI State & Local Cache** | Next.js Browser Context | `localStorage` |
