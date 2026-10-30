# 🏫 Timetable Management System — Backend API

Node.js + Express + MongoDB REST API for the School Timetable Management System.

---

## 📁 Project Structure

```
timetable-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── middleware/
│   ├── auth.js                # JWT protect + role guard
│   └── errorHandler.js        # Global error handler
├── models/
│   ├── User.js                # Admin / teacher accounts
│   ├── Teacher.js             # Teacher profiles + availability
│   ├── Subject.js             # Subjects / courses
│   ├── Class.js               # Class sections + subject assignments
│   ├── Room.js                # Rooms / labs
│   └── Timetable.js           # Schedule entries (core model)
├── routes/
│   ├── auth.js                # Login, register, profile
│   ├── teachers.js            # Teacher CRUD + workload
│   ├── classes.js             # Class CRUD + subject assignment
│   ├── rooms.js               # Room CRUD + free-slot query
│   ├── subjects.js            # Subject CRUD
│   ├── timetable.js           # Timetable CRUD + conflict detection + free slots
│   └── dashboard.js           # Stats + workload summary
├── server.js                  # Express app entry point
├── seed.js                    # Sample data seeder
├── .env.example
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set MONGO_URI, JWT_SECRET
```

### 3. Seed sample data
```bash
npm run seed
# Creates: 1 admin, 12 teachers, 12 subjects, 3 classes, 10 rooms, 1 timetable
```

### 4. Start server
```bash
npm run dev        # development (nodemon)
npm start          # production
```

Server runs on: `http://localhost:5000`

---

## 🔐 Authentication

All routes (except `/api/auth/login` and `/api/auth/register`) require a Bearer token.

```
Authorization: Bearer <token>
```

Token is returned on login / register.

---

## 📡 API Reference

### Auth

| Method | Endpoint                   | Description            | Auth |
|--------|----------------------------|------------------------|------|
| POST   | /api/auth/register         | Register admin user    | ❌   |
| POST   | /api/auth/login            | Login                  | ❌   |
| GET    | /api/auth/me               | Get current user       | ✅   |
| PUT    | /api/auth/profile          | Update profile         | ✅   |
| PUT    | /api/auth/change-password  | Change password        | ✅   |

**Login example:**
```json
POST /api/auth/login
{
  "email": "admin@school.com",
  "password": "admin123"
}
```
Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "name": "Admin User", "role": "admin" }
}
```

---

### Teachers

| Method | Endpoint                        | Description                   |
|--------|---------------------------------|-------------------------------|
| GET    | /api/teachers                   | List all teachers             |
| GET    | /api/teachers/:id               | Get single teacher            |
| POST   | /api/teachers                   | Create teacher                |
| PUT    | /api/teachers/:id               | Update teacher                |
| DELETE | /api/teachers/:id               | Deactivate teacher            |
| GET    | /api/teachers/:id/workload      | Teacher's period workload     |
| GET    | /api/teachers/workload/all      | All teachers workload summary |

**Query params for GET /api/teachers:**
- `department` — filter by department
- `isActive` — `true`/`false`
- `search` — name search

**Create teacher body:**
```json
{
  "teacherId": "TCH013",
  "name": "Ravi Shankar",
  "email": "ravi@school.com",
  "department": "Science",
  "subjects": ["<subjectObjectId>"],
  "maxPeriodsPerWeek": 28,
  "qualification": "M.Sc Physics",
  "phone": "9876543210"
}
```

---

### Classes

| Method | Endpoint                  | Description                 |
|--------|---------------------------|-----------------------------|
| GET    | /api/classes              | List all classes            |
| GET    | /api/classes/:id          | Get single class            |
| POST   | /api/classes              | Create class                |
| PUT    | /api/classes/:id          | Update class                |
| DELETE | /api/classes/:id          | Delete class                |
| POST   | /api/classes/:id/subjects | Assign subjects to class    |

**Create class body:**
```json
{
  "name": "Class 12",
  "section": "A",
  "grade": "12",
  "department": "Science",
  "strength": 40,
  "classTeacher": "<teacherObjectId>",
  "academicYear": "2024-25",
  "subjects": [
    { "subject": "<subjectId>", "teacher": "<teacherId>" }
  ]
}
```

---

### Rooms

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/rooms                 | List all rooms                     |
| GET    | /api/rooms/:id             | Get single room                    |
| POST   | /api/rooms                 | Create room                        |
| PUT    | /api/rooms/:id             | Update room                        |
| DELETE | /api/rooms/:id             | Deactivate room                    |
| GET    | /api/rooms/query/free-slots| Rooms free at a given day+period   |

**Free room slots query:**
```
GET /api/rooms/query/free-slots?day=Monday&periodIndex=0&academicYear=2024-25
```

---

### Subjects

| Method | Endpoint          | Description      |
|--------|-------------------|------------------|
| GET    | /api/subjects     | List subjects    |
| GET    | /api/subjects/:id | Get subject      |
| POST   | /api/subjects     | Create subject   |
| PUT    | /api/subjects/:id | Update subject   |
| DELETE | /api/subjects/:id | Delete subject   |

---

### Timetable

| Method | Endpoint                       | Description                            |
|--------|--------------------------------|----------------------------------------|
| GET    | /api/timetable                 | List all timetables (no entries)       |
| GET    | /api/timetable/:id             | Full timetable with entries            |
| GET    | /api/timetable/class/:classId  | Timetable for a specific class         |
| POST   | /api/timetable                 | Create timetable                       |
| PUT    | /api/timetable/:id             | Replace all entries                    |
| PATCH  | /api/timetable/:id/entry       | Add/update a single slot               |
| DELETE | /api/timetable/:id/entry       | Remove a single slot                   |
| PATCH  | /api/timetable/:id/publish     | Publish / unpublish                    |
| GET    | /api/timetable/free-slots/query| Free teachers + rooms at a slot        |
| DELETE | /api/timetable/:id             | Delete timetable                       |

**Create timetable:**
```json
POST /api/timetable
{
  "class": "<classObjectId>",
  "academicYear": "2024-25",
  "workingDays": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
  "periods": [
    { "index": 0, "label": "Period 1", "startTime": "08:00", "endTime": "08:50", "isBreak": false },
    { "index": 1, "label": "Period 2", "startTime": "08:50", "endTime": "09:40", "isBreak": false },
    { "index": 2, "label": "Break",    "startTime": "09:40", "endTime": "10:00", "isBreak": true  }
  ],
  "entries": [
    {
      "day": "Monday",
      "periodIndex": 0,
      "subject": "<subjectId>",
      "teacher": "<teacherId>",
      "room": "<roomId>"
    }
  ]
}
```

**Update a single slot:**
```json
PATCH /api/timetable/:id/entry
{
  "day": "Monday",
  "periodIndex": 2,
  "subject": "<subjectId>",
  "teacher": "<teacherId>",
  "room": "<roomId>",
  "notes": "Extra class"
}
```

**Free slots query:**
```
GET /api/timetable/free-slots/query?day=Tuesday&periodIndex=3&academicYear=2024-25
```
Returns free teachers AND free rooms for that slot.

**Conflict detection** is automatic on create, PUT, and PATCH/entry. Returns HTTP 409 with conflict details if a teacher or room is double-booked.

**Publish:**
```json
PATCH /api/timetable/:id/publish
{ "publish": true }
```

---

### Dashboard

| Method | Endpoint                         | Description                   |
|--------|----------------------------------|-------------------------------|
| GET    | /api/dashboard/stats             | Summary counts + dept chart   |
| GET    | /api/dashboard/workload-summary  | Overloaded / balanced teachers|

**Stats response:**
```json
{
  "data": {
    "summary": {
      "totalTeachers": 12,
      "totalClasses": 3,
      "totalRooms": 10,
      "totalSubjects": 12,
      "totalTimetables": 1,
      "publishedTimetables": 1,
      "completionRate": 100
    },
    "departmentBreakdown": [
      { "_id": "Science", "count": 4 }
    ]
  }
}
```

---

## 🗄️ MongoDB Collections

| Collection  | Purpose                                      |
|-------------|----------------------------------------------|
| users       | Admin accounts (with hashed passwords)       |
| teachers    | Teacher profiles, subjects, availability     |
| subjects    | Subjects with periods-per-week               |
| classes     | Class sections + subject-teacher assignments |
| rooms       | Rooms/labs with capacity and facilities      |
| timetables  | Schedule entries (day + period + teacher + room + subject) |

---

## ⚡ Conflict Detection Logic

When creating/editing a timetable entry the API checks across **all** timetables for the same `academicYear`:

1. **Teacher conflict** — same teacher assigned to another class at the same day+period
2. **Room conflict** — same room used by another class at the same day+period

Returns `HTTP 409` with an array of conflicts if any are found.

---

## 🔧 Free Slot Finder

Two endpoints expose the "free slot" feature shown in the UI:

```
GET /api/timetable/free-slots/query?day=Monday&periodIndex=0&academicYear=2024-25
GET /api/rooms/query/free-slots?day=Monday&periodIndex=0&academicYear=2024-25
```

Both check all existing timetable entries and return resources not yet booked at that slot.
