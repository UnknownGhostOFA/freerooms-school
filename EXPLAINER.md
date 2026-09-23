# 🏫 FreeRooms School — System Explainer & Architecture Guide

Welcome to **FreeRooms School**! This document explains what this project is, the problem it solves, how it works under the hood, and how the entire tech stack connects together.

---

## 🎯 1. What is FreeRooms School?

**FreeRooms School** is an automated, crowdsourced timetable aggregator designed specifically for **Wrenn School** Sixth Formers (`https://wrenn-school.uk.arbor.sc`).

### ❓ The Problem It Solves:
- At school, Sixth Form students have **free study periods** throughout the day (Periods 1 to 5).
- However, students often wander the halls trying to find which classrooms are empty or designated for private study.
- Official school MIS portals (Arbor) only show each student's *individual* timetable, not a collective master list of every free study room across the school.

### 💡 The Solution:
- **FreeRooms School** combines the timetables of every student who logs in into a **single, collective live matrix**.
- If Student A has a designated study session in `Room 6B` and Student B has one in `Room 6F`, both rooms automatically sync to a **shared MongoDB Atlas cloud database**.
- Every student can immediately see all available free study rooms across **Week A** and **Week B**, with **zero timetable collisions or overlaps with active teaching classes**.

---

## 🏗️ 2. High-Level Architecture

The project consists of two independent sub-projects connected to a cloud database:

```
┌──────────────────────────────────────────────────────────┐
│                   Wrenn School Students                  │
│       (Accessing via Phones, Laptops, Chromebooks)       │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│             1. Next.js 16 Client App (Vercel)            │
│          URL: http://freeroom-frontend.vercel.app/       │
│                                                          │
│  - Arbor MIS Design Replica (Forest Green & Mint theme)  │
│  - Streamlined Period Matrix (Periods 1 to 5)            │
│  - Zero Login Flash with Hydration Guards                │
│  - 5-Minute Background Auto-Refresh Engine               │
│  - 1:1 Maxime Ducret 60fps Gravity Puzzle 404 Page      │
└──────────────┬────────────────────────────▲──────────────┘
               │                            │
    POST Student Logins               GET /api/matrix
   & Scraped Timetables            (Federated Study Rooms)
               │                            │
               ▼                            │
┌───────────────────────────────────────────┴──────────────┐
│              2. Express API Backend (Render)             │
│          URL: https://freeroom-server.onrender.com       │
│                                                          │
│  - Direct Internal Arbor Scraper & Auth Session Engine   │
│  - Multi-Student Batch Aggregation (/api/rooms/sync-batch│
│  - 10-Minute Self-Ping Keep-Alive (Prevents Sleep)       │
│  - Arbor-Styled Server Status Dashboard (GET /)          │
└────────────────────────────┬─────────────────────────────┘
                             │
                      Mongoose Driver
                    (Public DNS Fallback)
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                3. MongoDB Atlas Cloud Cluster            │
│      Cluster: database.cv4cnz0.mongodb.net               │
│      Database: freerooms_school                          │
│      Collection: freerooms (Alphanumeric Room Index)     │
└──────────────────────────────────────────────────────────┘
```

---

## ⚙️ 3. How It Works Step-by-Step

### Step 1: Secure School Login
1. When a student opens the app (`/login` or `/`), they enter their official school email (e.g. `student@wrennschool.org.uk`) and Arbor password.
2. The app communicates directly with Wrenn School's internal Arbor endpoint (`https://wrenn-school.uk.arbor.sc/auth/login`).
3. It securely verifies credentials, retrieves their session cookie, and extracts their internal Student ID.
4. *Zero passwords or student emails are ever stored or exposed.*

### Step 2: Automated Calendar Scraping
1. Once logged in, the system requests the student's multiday calendar (`/calendar-entry/list-static/format/json/`).
2. It parses the weekly timetable, extracting all scheduled lessons, teacher names, start/end times, and room locations (`Location` tooltips).

### Step 3: Free Study Room Identification & Normalization
1. The engine scans for any lesson marked as `6th form study`, `private study`, `st1`, `st2`, or designated study blocks (such as `6B`, `6D`, `6E`, `6F`, `6`, `7`, `22`).
2. **Alphanumeric Sanitization**: Room names are stripped of raw prefixes (e.g. `room-6f`, `1: 6F`, `Room 6F` ➔ `6F`).

### Step 4: MongoDB Atlas Cloud Federation
1. The extracted study rooms are sent in a single batch to the backend (`POST /api/rooms/sync-batch`).
2. Rooms are saved directly into the **MongoDB Atlas cluster** (`freerooms_school`).
3. Because all students share the same MongoDB database, every student who logs in expands the collective pool of discovered free rooms for everyone else.

### Step 5: Strict Zero-Class-Overlap Engine
1. Before any room is displayed on the matrix, the system runs `isRoomOccupiedByClass(...)`.
2. If a room has an active timetabled teaching class (e.g. Computing, Maths, Science) in that exact period and day, it is **strictly excluded** from being shown as free.
3. This guarantees that students are never sent to a room where a teacher is conducting a class.

### Step 6: Real-Time Synchronization & 5-Minute Auto-Refresh
1. The frontend polls `/api/matrix?week=A` and `/api/matrix?week=B` on boot and automatically every **5 minutes**.
2. Any room added or discovered by a friend immediately appears on everyone's screen in real-time.

---

## 🕒 4. Period Timetable Structure

The app operates on a focused **Periods 1 to 5** schedule:

| Period | Time Block | Description |
|---|---|---|
| **Period 1** | `09:10 – 10:10` | Morning Session 1 |
| **Period 2** | `10:10 – 11:10` | Morning Session 2 |
| **Break** | `11:10 – 11:30` | School Break |
| **Period 3** | `11:30 – 12:30` | Midday Session |
| **Period 4** | `12:30 – 13:30` | Afternoon Session 1 |
| **Lunch** | `13:30 – 14:10` | School Lunch |
| **Period 5** | `14:10 – 15:10` | Final Session |

---

## 🕹️ 5. Easter Eggs & Special Features

- **🎮 Maxime Ducret 60fps 404 Puzzle Game**:
  - Visiting any unmapped page (like `/404`) launches a 13×13 gravity rotation maze game with smooth physics, 5 playable levels, par scoring, and victory confetti.
- **⚡ Keep-Alive Heartbeat**:
  - The backend server self-pings every 10 minutes to prevent Render free-tier web services from sleeping.
- **🛡️ Deployment Hydration Protection**:
  - Automatically resets stale cache upon new deployments, eliminating split-second login flashes.

---

## 🔒 6. Disclaimer & Security

- **Independent Utility**: FreeRooms School is an independent student utility built to help Sixth Formers find quiet study spaces. It is not affiliated with, endorsed by, or officially associated with Wrenn School or Arbor Education / The Key Group.
- **Zero Personal Data Storage**: No personal emails, passwords, or personal student profiles are stored on the servers.
