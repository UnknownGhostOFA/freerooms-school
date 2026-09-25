# Arbor MIS Complete API Reference (Parent Portal & Student Portal)

Comprehensive documentation of internal Arbor MIS endpoints, data structures, field definitions, authentication mechanisms, and usage instructions for both **Parent / Guardian** and **Student** portals.

---

## 1. Authentication & Session Management

Arbor MIS uses cookie-based session authentication (`mis`, `arbor_session`, `PHPSESSID`) backed by an Ed25519 JWT for identity authorization.

### `POST /auth/login?lang=en`
Authenticates a student, parent, guardian, or staff member.

- **URL**: `https://{schoolUrl}/auth/login?lang=en`
- **Method**: `POST`
- **Headers**:
  ```http
  Content-Type: application/json
  X-Requested-With: XMLHttpRequest
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
  ```
- **Request Payload**:
  ```json
  {
    "items": [
      {
        "username": "wsc-20dhpa@wrennschool.org.uk",
        "password": "papanmom1986"
      }
    ]
  }
  ```
- **What It Returns**:
  - `Set-Cookie` headers containing `mis=...; arbor_session=...; PHPSESSID=...;`
  - JSON response body:
    ```json
    {
      "items": [],
      "success": true,
      "action_params": [],
      "notifications": []
    }
    ```
- **How to Use It**:
  1. Pass the student or guardian email/username in `username` and password in `password`.
  2. Capture the `mis` or `arbor_session` cookie from the response.
  3. Attach this cookie to all subsequent API requests as `Cookie: mis=...`.

---

### `GET /auth/current-user-settings/format/json`
Retrieves authenticated user profile, identity type (`student` vs `guardian`), user ID, tenant ID, and JWT.

- **URL**: `https://{schoolUrl}/auth/current-user-settings/format/json`
- **Method**: `GET`
- **Headers**:
  ```http
  Cookie: mis=6f69034e284b93c1b1a1d397c5
  X-Requested-With: XMLHttpRequest
  ```
- **What It Returns (Student Profile Data)**:
  ```json
  {
    "items": [
      {
        "session_id": "6f69034e284b93c1b1a1d397c5",
        "logged_in": true,
        "display_name": "Dhyan Patoliya",
        "user_type": "student",
        "userId": 22427,
        "applicationId": "uk_nth_139961",
        "institutionType": "MIS",
        "isParentPortalOrStudentPortal": true,
        "organizationName": "Wrenn School",
        "calendarUrl": "/students/widget-data/get-calendar-data/student-id/10433",
        "jwt": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSIsImtpZCI6InNpcy1qd3QtZWQyNTUxOS1wdWJsaWMifQ..."
      }
    ],
    "success": true
  }
  ```
- **Field Dictionary**:
  - `user_type`: Account role (`"student"` or `"guardian"`).
  - `display_name`: Full name of the user (e.g. `"Dhyan Patoliya"`).
  - `calendarUrl`: Auto-configured timetable endpoint path containing the `student-id` (e.g. `10433`).
  - `applicationId`: Unique school tenant slug (e.g. `uk_nth_139961`).
  - `jwt`: Ed25519 token for API verification.
- **How to Use It**:
  - Extract the student's numeric ID directly from `calendarUrl` using regex: `/student-id\/(\d+)/`.
  - Check `user_type` to determine if guardian endpoints (`/guardians/...`) or student endpoints (`/students/...`) should be called.

---

## 2. Student Portal Timetable & Academic APIs

### ⭐ `GET /students/widget-data/get-calendar-data/student-id/{studentId}`
**PRIMARY STUDENT ROOM API**: Returns structured JSON with room codes directly for the current day.

- **URL**: `https://{schoolUrl}/students/widget-data/get-calendar-data/student-id/{studentId}`
  - Example: `/students/widget-data/get-calendar-data/student-id/10433`
- **Method**: `GET`
- **Headers**:
  ```http
  Cookie: mis=...;
  Accept: application/json
  X-Requested-With: XMLHttpRequest
  ```
- **What It Returns**:
  ```json
  {
    "items": [
      {
        "fields": {
          "color_index": { "value": "4" },
          "start_datetime": { "value": "2026-09-25 08:40:00" },
          "end_datetime": { "value": "2026-09-25 09:10:00" },
          "title": { "value": "Year 13: 13A Niki Kirk-Roberts/serena T (Fri)" },
          "location": { "value": "17" },
          "url": { "value": "" }
        }
      },
      {
        "fields": {
          "color_index": { "value": "4" },
          "start_datetime": { "value": "2026-09-25 09:10:00" },
          "end_datetime": { "value": "2026-09-25 10:10:00" },
          "title": { "value": "6th form study: Year 13: 13D/St2" },
          "location": { "value": "6" },
          "url": { "value": "" }
        }
      },
      {
        "fields": {
          "color_index": { "value": "4" },
          "start_datetime": { "value": "2026-09-25 10:10:00" },
          "end_datetime": { "value": "2026-09-25 11:10:00" },
          "title": { "value": "Photography: Year 13: 13C/Pt" },
          "location": { "value": "CP4" },
          "url": { "value": "" }
        }
      },
      {
        "fields": {
          "color_index": { "value": "4" },
          "start_datetime": { "value": "2026-09-25 11:30:00" },
          "end_datetime": { "value": "2026-09-25 12:30:00" },
          "title": { "value": "Media Studies: Year 13: 13B/Me" },
          "location": { "value": "21" },
          "url": { "value": "" }
        }
      },
      {
        "fields": {
          "color_index": { "value": "4" },
          "start_datetime": { "value": "2026-09-25 14:10:00" },
          "end_datetime": { "value": "2026-09-25 15:10:00" },
          "title": { "value": "6th form study: Year 13: 13H/St2" },
          "location": { "value": "6F" },
          "url": { "value": "" }
        }
      }
    ],
    "success": true,
    "action_params": { "total": 5 }
  }
  ```
- **Field Dictionary**:
  - `fields.location.value`: **The exact Room Code** (e.g. `17`, `6`, `CP4`, `21`, `6F`).
  - `fields.title.value`: Subject / Class name (e.g. `6th form study: Year 13: 13D/St2`).
  - `fields.start_datetime.value`: Start timestamp (`YYYY-MM-DD HH:MM:SS`).
  - `fields.end_datetime.value`: End timestamp (`YYYY-MM-DD HH:MM:SS`).
- **How to Use It**:
  Call this endpoint to instantly get all scheduled rooms for today. Study rooms are identified where `title` contains `study` or `location` starts with `6`.

---

### `POST /calendar-entry/list-static/format/json/`
Fetches multi-week timetable matrix (Week A & Week B) for students.

- **URL**: `https://{schoolUrl}/calendar-entry/list-static/format/json/`
- **Method**: `POST`
- **Headers**:
  ```http
  Cookie: mis=...;
  Content-Type: application/json
  X-Requested-With: XMLHttpRequest
  ```
- **Request Body**:
  ```json
  {
    "action_params": {
      "view": "multiday",
      "startDate": "2026-09-07",
      "endDate": "2026-09-11",
      "filters": [
        {
          "field_name": "object",
          "value": {
            "_objectTypeId": 1,
            "_objectId": 10433
          }
        }
      ]
    }
  }
  ```
- **What It Returns**:
  JSON object containing `items[0].fields.response.value.pages[].html` with table cells (`<td>`) for each weekday and events (`<div class="mis-cal-event" data-eventid="...">`).
- **How to Use It**:
  1. Regex parse event IDs: `/<div[^>]*data-eventid=["']([^"']*)["']/gi`.
  2. Call the Tooltip API with each `eventId` to retrieve staff and room metadata.

---

### `GET /students/calendar-entry/tooltip/id/{eventId}`
Fetches staff and location tooltip details for student events.

- **URL**: `https://{schoolUrl}/students/calendar-entry/tooltip/id/{eventId}`
  - Example: `/students/calendar-entry/tooltip/id/35475968`
- **Method**: `GET`
- **Headers**:
  ```http
  Cookie: mis=...;
  X-Requested-With: XMLHttpRequest
  ```
- **What It Returns (HTML)**:
  ```html
  <div class="mis-tooltip">
      <div class="header">
          <div class="title">Photography: Year 13: 13C/Pt</div>
      </div>
      <div class="content">
          <ul class="aligned-list">
              <li><b>Lesson</b>:<span>Photography: Year 13: 13C/Pt</span></li>
              <li><b>Location</b>:<span>Room CP4</span></li>
              <li><b>Staff</b>:<span>Mrs Clarke- Jones</span></li>
          </ul>
      </div>
  </div>
  ```
- **How to Use It**:
  - Extract Room: `<b>Location<\/b>:<span>(.*?)<\/span>`
  - Extract Staff: `<b>Staff<\/b>:<span>(.*?)<\/span>`

---

### `GET /navigation/main-menu/format/json`
Returns student navigation tree and portal routes.

- **URL**: `https://{schoolUrl}/navigation/main-menu/format/json`
- **Method**: `GET`
- **What It Returns**:
  ```json
  {
    "items": [
      {
        "items": [
          { "fields": { "text": { "value": "Dashboard" }, "url": { "value": "/students/home-ui/dashboard" } } },
          { "fields": { "text": { "value": "My Account" }, "url": { "value": "/students/my-mis-ui/my-account" } } },
          { "fields": { "text": { "value": "My Assignments" }, "url": { "value": "/students/home-ui/assignments" } } },
          { "fields": { "text": { "value": "My Calendar" }, "url": { "value": "/students/my-mis-ui/calendar" } } },
          { "fields": { "text": { "value": "My Exams" }, "url": { "value": "/students/student-ui/my-examinations" } } },
          { "fields": { "text": { "value": "My Reports" }, "url": { "value": "/students/student-ui/my-reports" } } }
        ]
      }
    ]
  }
  ```

---

## 3. Parent / Guardian Portal Timetable & Room APIs

### ⭐ `GET /guardians/widget-data/get-calendar-data/student-id/{studentId}/date/{YYYY-MM-DD}`
**PRIMARY GUARDIAN ROOM API**: Provides pure structured JSON with room codes directly for any specific date.

- **URL**: `https://{schoolUrl}/guardians/widget-data/get-calendar-data/student-id/{studentId}/date/{YYYY-MM-DD}`
  - Example: `/guardians/widget-data/get-calendar-data/student-id/10433/date/2026-09-25`
- **Method**: `GET`
- **Headers**:
  ```http
  Cookie: mis=...;
  Accept: application/json
  X-Requested-With: XMLHttpRequest
  ```
- **What It Returns**:
  ```json
  {
    "items": [
      {
        "fields": {
          "start_datetime": { "value": "2026-09-25 09:10:00" },
          "end_datetime": { "value": "2026-09-25 10:10:00" },
          "title": { "value": "6th form study: Year 13: 13D/St2" },
          "location": { "value": "6" },
          "color_index": { "value": 4 },
          "url": { "value": "/guardians/student-ui/calendar-event/student-id/10433/calendar-entry-mapping-id/37527392" }
        }
      },
      {
        "fields": {
          "start_datetime": { "value": "2026-09-25 10:10:00" },
          "end_datetime": { "value": "2026-09-25 11:10:00" },
          "title": { "value": "Photography: Year 13: 13C/Pt" },
          "location": { "value": "CP4" },
          "color_index": { "value": 4 },
          "url": { "value": "/guardians/student-ui/calendar-event/student-id/10433/calendar-entry-mapping-id/35475968" }
        }
      }
    ],
    "action_params": {
      "previousDayUrl": "/guardians/widget-data/get-calendar-data/student-id/10433/date/2026-09-24",
      "todayUrl": "/guardians/widget-data/get-calendar-data/student-id/10433/date/2026-09-25",
      "nextDayUrl": "/guardians/widget-data/get-calendar-data/student-id/10433/date/2026-09-28"
    }
  }
  ```
- **How to Use It**:
  Iterate through school dates using `nextDayUrl` to scrape the full term's room bookings in structured JSON.

---

### `GET /guardians/calendar-entry/tooltip/id/{eventId}`
Fetches staff name and lesson notes for guardian calendar events.

- **URL**: `https://{schoolUrl}/guardians/calendar-entry/tooltip/id/{eventId}`
- **Method**: `GET`
- **What It Returns (HTML)**:
  ```html
  <div class="mis-tooltip">
      <div class="header">
          <div class="title">Photography: Year 13: 13C/Pt</div>
      </div>
      <div class="content">
          <ul class="aligned-list">
              <li><b>Lesson</b>:<span>Photography: Year 13: 13C/Pt</span></li>
              <li><b>Date</b>:<span>Fri, 25 Sep 2026, 10:10 - 11:10</span></li>
              <li><b>Staff</b>:<span>Mrs Clarke- Jones</span></li>
          </ul>
      </div>
  </div>
  ```

---

## 4. Side-by-Side Comparison: Student vs. Guardian APIs

| Feature | Student Portal | Parent / Guardian Portal |
| :--- | :--- | :--- |
| **Login Credentials** | `wsc-20dhpa@wrennschool.org.uk` | `dhyanpatoliya1@gmail.com` |
| **User Role Flag** | `user_type: "student"` | `user_type: "guardian"` |
| **Calendar Widget Path** | `/students/widget-data/get-calendar-data/student-id/{id}` | `/guardians/widget-data/get-calendar-data/student-id/{id}/date/{date}` |
| **Direct JSON Room Codes** | **YES** (`fields.location.value`) | **YES** (`fields.location.value`) |
| **Multi-Day Grid API** | `POST /calendar-entry/list-static/format/json/` | `POST /calendar-entry/list-static/format/json/` |
| **Tooltip Endpoint** | `/students/calendar-entry/tooltip/id/{id}` | `/guardians/calendar-entry/tooltip/id/{id}` |

---

## 5. Universal Scraper Implementation (TypeScript)

```typescript
import { cleanRoomCode, matchTimeToPeriod, isStudyLesson } from '@/lib/crowdsourceEngine';

export async function fetchArborRooms(schoolUrl: string, cookie: string, userType: 'student' | 'guardian', studentId: number, dates: string[]) {
  const studyRooms = [];

  for (const date of dates) {
    const endpoint = userType === 'student'
      ? `${schoolUrl}/students/widget-data/get-calendar-data/student-id/${studentId}`
      : `${schoolUrl}/guardians/widget-data/get-calendar-data/student-id/${studentId}/date/${date}`;

    const res = await fetch(endpoint, {
      headers: {
        'Cookie': cookie,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (res.ok) {
      const data = await res.json();
      for (const item of data.items || []) {
        const fields = item.fields || {};
        const rawRoom = fields.location?.value || '';
        const subject = fields.title?.value || '';
        const start = fields.start_datetime?.value?.split(' ')[1]?.substring(0, 5) || '';

        const cleanCode = cleanRoomCode(rawRoom);
        const period = matchTimeToPeriod(start);
        const isStudy = isStudyLesson(subject) || cleanCode.startsWith('6');

        if (isStudy && cleanCode && period) {
          studyRooms.push({
            roomCode: cleanCode,
            periodId: period.id,
            subject,
            start
          });
        }
      }
    }
  }

  return studyRooms;
}
```
