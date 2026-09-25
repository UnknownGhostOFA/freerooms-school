# FreeRooms School: Complete Architecture, Flow & Code Reference

## 1. System Responsibility Matrix

| Component | File Path | Responsibility |
| :--- | :--- | :--- |
| **Login API Endpoint** | `frontend/src/app/api/auth/arbor/login/route.ts` | Next.js server route receiving login credentials, initiating scraping, and batch-dispatching rooms to MongoDB Atlas. |
| **Arbor Scraper & Auth Engine** | `frontend/src/lib/arborAuthService.ts` | Handles Arbor session creation, HTML calendar table parsing, tooltip scraping, and in-memory session management. |
| **Crowdsource & Timetable Engine** | `frontend/src/lib/crowdsourceEngine.ts` | Period matching (P1–P5), room code sanitization, Week A/B determination, and baseline dataset ingestion. |
| **Client UI State & Context** | `frontend/src/context/ArborMatrixContext.tsx` | Hydration from `localStorage`, 5-minute background polling, instant local state updates, and modal management. |
| **MongoDB Atlas API Server** | `server/server.js` | Express server running on Render, FreeRoom Mongoose model, batch upserts, manual room routes, and keep-alive pinger. |

---

## 2. Authentication & Session Flow

### Detailed Sequence & Line Numbers

1. **User Submits Credentials in UI**
   - **File**: `frontend/src/components/modals/DirectSchoolLoginModal.tsx` (Lines 37–52)
   - User provides school URL (e.g. `wrenn.uk.arbor.sc`), email/username, and password.
   - Dispatches `POST` request to `/api/auth/arbor/login`.

2. **Next.js Auth Route Dispatcher**
   - **File**: `frontend/src/app/api/auth/arbor/login/route.ts` (Lines 13–32)
   - Validates input and calls `authenticateArbor()`.

3. **Arbor Internal Auth API Request**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 51–76)
   - Sanitizes URL and sends `POST ${cleanUrl}/auth/login?lang=en`.
   - Headers configured with `X-Requested-With: XMLHttpRequest` (Line 66) and browser `User-Agent` (Line 68).

4. **Cookie Extraction & Session Verification**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 77–82, 329–336)
   - Function `extractCookiesFromResponse()` captures `arbor_session` and `PHPSESSID` cookies from HTTP response headers.

5. **Student ID Resolution**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 86–106)
   - Requests `GET ${cleanUrl}/auth/current-user-settings/format/json` with session cookies.
   - Extracts numeric `studentId` using regex: `/student-id\/(\d+)/` (Line 98).

6. **Server Memory Session Storage**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 16, 108–119)
   - Saved in `sessionStore` (`Map<string, ArborSession>`) under key `${cleanUrl}::${username.toLowerCase()}`.
   - Retains: `cookies`, optional encrypted password for renewal, `studentId`, `expiresAt` (12-hour TTL), and cached data.

7. **Client `localStorage` Session Persistence**
   - **File**: `frontend/src/context/ArborMatrixContext.tsx` (Lines 65–71, 148–159)
   - Stores safe metadata in browser `localStorage`: `{ name, email, studentId, schoolUrl, loggedInAt }` under key `'arbor_student_session_v10'`.
   - Verifies against `APP_DEPLOY_  BUILD = 'freerooms_deploy_v10_prod'` to clear stale sessions on new deployments.

---

## 3. Timetable Extraction & Parsing

### Detailed Sequence & Line Numbers

1. **Two-Week Date Window Computation**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 168–184)
   - Computes Monday-to-Friday ISO dates (`YYYY-MM-DD`) for the current week and next week.
   - Evaluates academic calendar cycle (`A` or `B`) using `getCurrentSchoolWeek()` (`frontend/src/lib/crowdsourceEngine.ts` Lines 46–53).

2. **Arbor Calendar API Query**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 190–215)
   - Endpoint: `POST ${cleanUrl}/calendar-entry/list-static/format/json/`
   - Payload: `{ action_params: { view: 'multiday', startDate, endDate, filters: [{ field_name: 'object', value: { _objectTypeId: 1, _objectId: studentId } }] } }`
   - Response contains raw HTML calendar pages in `items[0].fields.response.value.pages`.

3. **HTML Event Regex Extraction**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 346–382)
   - Iterates through day columns (`<td>`) 1 to 5 (Mon to Fri):
     - **Line 349**: Column match: `/<td[^>]*>([\s\S]*?)<\/td>/gi`
     - **Line 350**: Calendar event match: `/<div[^>]*class=["'][^"']*mis-cal-event[^"']*["'][^>]*data-eventid=["']([^"']*)["'][^>]*>/gi`
     - **Line 351**: Time range match: `/class=["'][^"']*mis-cal-event-time[^"']*["']>([^<]+)</i`
     - **Line 352**: Subject title match: `/<b[^>]*class=["']title["'][^>]*>([^<]+)<\/b>/i`

4. **Location & Supervisor Tooltip Scraping**
   - **File**: `frontend/src/lib/arborAuthService.ts` (Lines 230–246)
   - Endpoint: `GET ${cleanUrl}/students/calendar-entry/tooltip/id/${ev.eventId}`
   - Regex matches:
     - **Line 240**: `<b>Location<\/b>:<span>(.*?)<\/span>` (Room code)
     - **Line 241**: `<b>Staff<\/b>:<span>(.*?)<\/span>` (Teacher/Supervisor)

5. **Period Matching & Sanitization**
   - **File**: `frontend/src/lib/crowdsourceEngine.ts`
   - **Lines 20–31**: `matchTimeToPeriod(timeStr)`
     - Form Time (`08:40 - 09:10`) -> `null` (Filtered out)
     - Period 1 (`09:10 - 10:10`) -> `p1` (Number: 1)
     - Period 2 (`10:10 - 11:10`) -> `p2` (Number: 2)
     - Period 3 (`11:30 - 12:30`) -> `p3` (Number: 3)
     - Period 4 (`12:30 - 13:30`) -> `p4` (Number: 4)
     - Period 5 (`14:10 - 15:10`) -> `p5` (Number: 5)
   - **Lines 33–40**: `cleanRoomCode(raw)`
     - Strips prefixes (`Room:`, `Room `), removes special characters, and converts to uppercase.
   - **Lines 67–78**: `isStudyLesson(subject)`
     - Matches keywords: `study`, `6th form study`, `st1`, `st2`, `free`, `private study`.

---

## 4. Database Storage & Persistence Flow

### MongoDB Mongoose Schema
- **File**: `server/server.js` (Lines 26–40)

```javascript
const FreeRoomSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },       // Line 27: Unique key (e.g. sync-A-1-p3-6D1)
  roomCode: { type: String, required: true },               // Line 28: Clean room identifier (e.g. 6D1, ST2)
  weekType: { type: String, enum: ['A', 'B'], required: true }, // Line 29: Week cycle ('A' or 'B')
  dayOfWeek: { type: Number, required: true },              // Line 30: 1=Mon ... 5=Fri
  dayName: { type: String, required: true },                // Line 31: Day string name ("Monday")
  periodId: { type: String, required: true },               // Line 32: "p1" to "p5"
  periodNumber: { type: Number, required: true },           // Line 33: Numeric period (1 to 5)
  lessonSubject: { type: String, default: 'Free Study Room (Reported by Student)' }, // Line 34
  supervisor: { type: String },                             // Line 35: Supervisor / Teacher name
  contributedBy: { type: String, default: 'Student Submission' }, // Line 36
  isManual: { type: Boolean, default: true },               // Line 37: Submission type flag
  notes: { type: String },                                  // Line 38: Optional room notes
  createdAt: { type: Date, default: Date.now },             // Line 39: Ingestion timestamp
});
```

### Ingestion & Query Operations

1. **Automatic Batch Ingestion on Login**
   - **Client Dispatch**: `frontend/src/app/api/auth/arbor/login/route.ts` (Lines 51–95)
   - **Server Handler**: `server/server.js` (Lines 405–457)
   - **Route**: `POST /api/rooms/sync-batch`
   - **Operation** (Line 443): `FreeRoom.findOneAndUpdate({ id: uniqueId }, doc, { upsert: true, new: true })`
   - Deduplicates on compound key `sync-${week}-${dayNum}-${periodId}-${clean}`.

2. **Manual Free Room Submission**
   - **File**: `server/server.js` (Lines 460–503)
   - **Route**: `POST /api/rooms/manual`
   - **Operation** (Line 490): `FreeRoom.findOneAndUpdate({ id: roomId }, newRoom, { upsert: true, new: true })`
   - ID pattern: `manual-${weekType}-${Date.now()}-${clean}` (Line 471).

3. **Matrix Query & Deduplication**
   - **File**: `server/server.js` (Lines 311–402)
   - **Route**: `GET /api/matrix?week={A|B}`
   - Reads database rooms (`FreeRoom.find({ weekType: week })`, Lines 318–334).
   - Ingests baseline dataset `arbor-live-weeks.json` (Lines 337–370).
   - Merges and deduplicates using `Map` with key `${r.roomCode}-${r.dayOfWeek}-${r.periodId}` (Lines 373–389), giving priority to live database records.

---

## 5. Token & Storage Security Matrix

| Storage Layer | Location | Data Handled | Lifecycle / TTL |
| :--- | :--- | :--- | :--- |
| **Server In-Memory Map** | Next.js server runtime (`arborAuthService.ts:16`) | Raw `set-cookie` header strings, `studentId`, optional password | 12 Hours |
| **Client LocalStorage** | User's browser (`ArborMatrixContext.tsx:65-71`) | Sanitized session `{ name, email, studentId, schoolUrl, loggedInAt }` | Reset upon deployment build bump |
| **MongoDB Atlas** | Remote DB (`server.js:26-40`) | Anonymized room bookings, study periods, manual reports | Persistent |
