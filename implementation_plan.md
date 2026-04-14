# ScholasticaStars LMS — Implementation Plan

## Goal

Build a production-grade, student-only Learning Management System with React + Express + MongoDB. The system enforces admin-controlled access, device-based login restriction (max 3 devices), free/paid course gating, manual payment verification (bKash/Nagad/Rocket), and secure YouTube video embedding.

---

## Project Structure

```
scholasticastars 2.0/
├── server/                          # Express.js backend
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── index.js                 # Entry point — Express app bootstrap
│   │   ├── config/
│   │   │   └── db.js                # MongoDB Atlas connection
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Device.js
│   │   │   ├── Course.js
│   │   │   ├── Module.js
│   │   │   ├── Lesson.js
│   │   │   ├── CourseAssignment.js
│   │   │   ├── Payment.js
│   │   │   └── LiveClass.js
│   │   ├── middleware/
│   │   │   ├── verifyJWT.js
│   │   │   ├── requireVerified.js
│   │   │   ├── deviceGuard.js
│   │   │   ├── requireAdmin.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   ├── auth.js              # register, login, logout
│   │   │   ├── student.js           # courses, lessons, live classes, payments
│   │   │   └── admin.js             # full admin CRUD
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── studentController.js
│   │   │   └── adminController.js
│   │   └── utils/
│   │       ├── fingerprint.js       # Device fingerprint hashing
│   │       └── response.js          # Consistent JSON response helper
│   └── .gitignore
│
├── client/                          # React (Vite) frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css                # Global design system
│       ├── api/
│       │   └── axiosInstance.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── AdminRoute.jsx
│       │   ├── VideoPlayer.jsx
│       │   ├── CourseCard.jsx
│       │   ├── DeviceWarning.jsx
│       │   ├── Navbar.jsx
│       │   └── Sidebar.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── StudentDashboard.jsx
│           ├── CourseDetail.jsx
│           ├── LessonPlayer.jsx
│           ├── LiveClasses.jsx
│           ├── PaymentSubmit.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminStudents.jsx
│           ├── AdminPayments.jsx
│           ├── AdminCourseManager.jsx
│           └── AdminLiveClasses.jsx
│
└── README.md
```

---

## User Review Required

> [!IMPORTANT]
> **MongoDB Atlas URI** — You will need to provide a MongoDB Atlas connection string. I'll create a `.env.example` with placeholders. You must create a real `.env` with your credentials before running.

> [!IMPORTANT]
> **JWT Secret** — A strong random secret is required. I'll generate a placeholder; you should replace it for production.

> [!WARNING]
> **Device Fingerprinting Limitation** — Client-side fingerprinting (userAgent + Accept-Language + screen resolution hash) is not tamper-proof. It serves as a deterrent, not a cryptographic guarantee. This is acceptable for MVP per the spec.

> [!NOTE]
> **httpOnly Cookies vs localStorage** — The spec prefers httpOnly cookies for JWT. I will implement httpOnly cookie-based auth with a `/api/auth/me` endpoint for the frontend to check session state, since the client cannot read httpOnly cookies directly.

---

## Proposed Changes

### Phase 1 — Project Scaffolding

#### [NEW] Root files
- `README.md` — Project overview and setup instructions

#### [NEW] `server/` — Express.js backend scaffold
- `package.json` — Dependencies: express, mongoose, bcrypt, jsonwebtoken, cookie-parser, cors, dotenv, express-rate-limit, express-validator, helmet
- `.env.example` — Template for `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRY`, `CLIENT_URL`
- `.gitignore` — node_modules, .env, dist
- `src/index.js` — Express app bootstrap with all middleware and route mounting

#### [NEW] `client/` — React (Vite) scaffold
- Initialized via `npx -y create-vite@latest ./ --template react`
- Custom `vite.config.js` with API proxy to `http://localhost:5000`
- Global CSS design system in `src/index.css`

---

### Phase 2 — Database Schemas (Database Agent)

#### [NEW] All 8 Mongoose models

| Model | Key Fields | Indexes | Business Rules |
|-------|-----------|---------|----------------|
| **User** | name, email, studentId, passwordHash, role, isVerifiedStudent, status | `email` (unique), `studentId` (unique) | Rule 1: admin-only verification |
| **Device** | userId, deviceFingerprint, userAgent, ip, lastSeen | `userId + deviceFingerprint` (compound unique) | Rule 2: max 3 per user |
| **Course** | title, description, type, thumbnail, order, isPublished | `order`, `isPublished` | Rule 3: free vs paid gates |
| **Module** | courseId, title, order | `courseId + order` | Ordered within course |
| **Lesson** | moduleId, title, youtubeId, duration, order, isFree | `moduleId + order` | Rule 4: youtubeId never exposed without auth |
| **CourseAssignment** | userId, courseId, assignedAt, assignedBy | `userId + courseId` (compound unique) | Rule 3: gate paid access |
| **Payment** | userId, courseId, method, transactionId, amount, status, verifiedBy | `userId + courseId`, `status` | Payment flow |
| **LiveClass** | title, meetLink, scheduledAt, recordingUrl, isPublished, createdBy | `scheduledAt` | Phase 2 feature (included early) |

---

### Phase 3 — Middleware Stack (Security Agent + Backend Agent)

#### [NEW] `server/src/middleware/verifyJWT.js`
- Extracts JWT from httpOnly cookie `token`
- Decodes and attaches `req.user = { id, role, isVerifiedStudent }`
- Returns 401 on missing/invalid token

#### [NEW] `server/src/middleware/requireVerified.js`
- Checks `req.user.isVerifiedStudent === true`
- Returns 403 with message: "Account pending admin verification"

#### [NEW] `server/src/middleware/deviceGuard.js`
- Only runs on login route (called explicitly, not global)
- Implements the full Rule 2 device check logic
- Hashes fingerprint data from client before comparing

#### [NEW] `server/src/middleware/requireAdmin.js`
- Checks `req.user.role === "admin"`
- Returns 403 on non-admin

#### [NEW] `server/src/middleware/errorHandler.js`
- Catches all unhandled errors
- Returns `{ success: false, message: "..." }` format
- Logs error stack in development

#### [NEW] `server/src/middleware/rateLimiter.js`
- Uses `express-rate-limit`
- Login endpoint: 5 attempts per 15 minutes per IP

---

### Phase 4 — Auth Routes (Backend Agent + Security Agent)

#### [NEW] `server/src/routes/auth.js` + `server/src/controllers/authController.js`

| Route | Logic | Business Rules |
|-------|-------|----------------|
| `POST /api/auth/register` | Validate input → hash password → create user (isVerifiedStudent: false) → return success | Rule 1 |
| `POST /api/auth/login` | Validate creds → run deviceGuard → issue JWT as httpOnly cookie → return user data | Rule 1, 2 |
| `POST /api/auth/logout` | Clear httpOnly cookie | — |
| `GET /api/auth/me` | Return current user from JWT (for frontend session hydration) | — |

---

### Phase 5 — Admin Routes (Backend Agent)

#### [NEW] `server/src/routes/admin.js` + `server/src/controllers/adminController.js`

All routes behind `verifyJWT` + `requireAdmin`.

| Route | Logic |
|-------|-------|
| `GET /api/admin/students` | List all students with device count |
| `PATCH /api/admin/students/:id` | Approve (isVerifiedStudent), update status, reset devices |
| `DELETE /api/admin/devices/:id` | Remove specific device |
| `GET /api/admin/payments` | List payments (filter by status) |
| `PATCH /api/admin/payments/:id` | Verify → auto-create CourseAssignment, or reject |
| `POST /api/admin/assignments` | Manually assign paid course |
| `GET /api/admin/courses` | List all courses (including unpublished) |
| `POST /api/admin/courses` | Create course |
| `PUT /api/admin/courses/:id` | Update course |
| `POST /api/admin/modules` | Create module under course |
| `POST /api/admin/lessons` | Create lesson (accepts youtubeId) |
| `POST /api/admin/live-classes` | Schedule live class |
| `PATCH /api/admin/live-classes/:id` | Add recording URL, update details |

---

### Phase 6 — Student Routes (Backend Agent)

#### [NEW] `server/src/routes/student.js` + `server/src/controllers/studentController.js`

All routes behind `verifyJWT` + `requireVerified`.

| Route | Logic | Business Rules |
|-------|-------|----------------|
| `GET /api/courses` | Return published courses; mark paid courses as locked/unlocked based on assignment | Rule 3 |
| `GET /api/courses/:id` | Course detail + modules + lesson titles (no youtubeId unless access granted) | Rule 3, 4 |
| `GET /api/lessons/:id` | Return lesson with youtubeId **only if** free or assigned | Rule 3, 4 |
| `GET /api/live-classes` | Return published live classes (meetLink only for upcoming within 15 min) | — |
| `POST /api/payments` | Submit payment (method + transactionId + courseId) | Payment flow |

---

### Phase 7 — React Frontend (Frontend Agent)

#### Design System
- **Color palette**: Deep navy (#0f172a) background, electric blue (#3b82f6) primary, emerald (#10b981) success, amber (#f59e0b) warning, crimson (#ef4444) danger
- **Typography**: Inter (Google Fonts) — clean, modern, highly legible
- **Effects**: Glassmorphism cards, subtle hover animations, smooth transitions
- **Dark mode first**: Premium dark theme as default

#### Core Components

| Component | Purpose |
|-----------|---------|
| `AuthContext.jsx` | JWT session state, login/logout methods, `/api/auth/me` on mount |
| `axiosInstance.js` | Base URL, `withCredentials: true`, 401 interceptor → redirect to login |
| `ProtectedRoute.jsx` | Wraps student routes — redirects if not authenticated or not verified |
| `AdminRoute.jsx` | Wraps admin routes — redirects if not admin |
| `VideoPlayer.jsx` | Secure iframe wrapper, accepts `lessonId`, fetches youtubeId server-side, renders embed |
| `CourseCard.jsx` | Card with lock icon overlay for unassigned paid courses |
| `DeviceWarning.jsx` | Modal/alert for temp_banned users |
| `Navbar.jsx` | Top navigation with user info, logout |
| `Sidebar.jsx` | Admin sidebar navigation |

#### Pages

| Page | Role | Key Features |
|------|------|-------------|
| `Login.jsx` | Public | Email/password form, device fingerprint collection, DeviceWarning display |
| `Register.jsx` | Public | Self-registration form with student ID |
| `StudentDashboard.jsx` | Student | Free courses, assigned paid courses, locked courses with "Enroll" CTA, upcoming live classes, "Continue Learning" |
| `CourseDetail.jsx` | Student | Course info, modules accordion, lesson list with play buttons |
| `LessonPlayer.jsx` | Student | VideoPlayer embed + lesson info |
| `LiveClasses.jsx` | Student | Schedule list, countdown, Join button (reveals Meet link at join time) |
| `PaymentSubmit.jsx` | Student | Select method dropdown, transaction ID input, submit |
| `AdminDashboard.jsx` | Admin | Overview stats (pending students, pending payments, total courses) |
| `AdminStudents.jsx` | Admin | Student table with approve/ban/reset actions, device list per student |
| `AdminPayments.jsx` | Admin | Payment queue with verify/reject actions |
| `AdminCourseManager.jsx` | Admin | Full CRUD for courses, modules, lessons |
| `AdminLiveClasses.jsx` | Admin | Schedule form, recording URL management |

---

## Environment Variables

```env
# server/.env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/scholasticastars
JWT_SECRET=your-very-strong-random-secret-here
JWT_EXPIRY=7d
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

---

## Open Questions

> [!IMPORTANT]
> **Admin Seed Account** — Should I include a seed script to create an initial admin account (e.g., via `npm run seed`), or will you manually insert an admin user into MongoDB? I recommend a seed script.

> [!NOTE]
> **Course Thumbnails** — Should thumbnails be stored as external URLs (e.g., uploaded to a CDN), or as base64 in MongoDB? I recommend URL strings for MVP, with you managing image hosting separately.

---

## Verification Plan

### Automated Tests
1. Start the backend: `cd server && npm run dev` — verify MongoDB connection
2. Start the frontend: `cd client && npm run dev` — verify Vite dev server
3. Test full auth flow via browser:
   - Register → verify pending state
   - Login → verify JWT cookie set
   - Access protected route → verify 403 without verification
4. Test admin flows:
   - Approve student → verify access granted
   - Create course/module/lesson → verify data in DB
   - Payment verify → verify auto-assignment

### Manual Verification
- Browser-based testing of all pages
- Verify device fingerprint logic with multiple login attempts
- Verify youtubeId is never exposed in network responses for unauthorized users
- Verify CORS blocks requests from unauthorized origins
