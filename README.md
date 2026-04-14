# ScholasticaStars LMS

ScholasticaStars is a student-only learning management system built with a React + Vite frontend and an Express + MongoDB backend. It supports admin-controlled student verification, device-restricted login, free and paid course access, manual payment review, live classes, and protected lesson playback.

## Stack

- Client: React, React Router, Axios, Vite
- Server: Express, Mongoose, JWT, bcrypt, cookie-based auth
- Database: MongoDB Atlas

## Features

- Student self-registration with pending verification
- Admin-only approval and student/device management
- Device fingerprint tracking with a three-device limit
- Free and paid course gating with manual assignment
- Manual bKash, Nagad, and Rocket payment submission/review
- Authenticated lesson fetches with server-side YouTube gating
- Live class publishing with time-gated meeting links

## Project Structure

```text
scholasticastars 2.0/
├── client/
├── server/
├── implementation_plan.md
└── README.md
```

## Setup

### 1. Configure the backend

```bash
cd server
Copy-Item .env.example .env
```

Fill in the real values for:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Optional seed values are included if you want to create the first admin account via script.

For local MongoDB on this machine, the repo is already configured to use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/scholasticastars-local
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Start local MongoDB

From the repo root in PowerShell:

```powershell
.\server\scripts\startLocalMongo.ps1
```

This uses a workspace-local data directory at `server/.mongodb-data`.

### 4. Seed an admin user

```bash
cd server
npm run seed
```

The seed script uses `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `server/.env`.

### 5. Start both apps

```bash
cd server && npm run dev
cd client && npm run dev
```

- API: `http://localhost:5000`
- Client: `http://localhost:5173`

## Notes

- Authentication is stored in an `httpOnly` cookie called `token`.
- Device fingerprinting is a practical deterrent, not a tamper-proof identity signal.
- Lesson `youtubeId` values are only returned from protected lesson endpoints when the student is authorized.
