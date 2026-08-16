# SkillForge — Job & Student Task Platform

Full-stack learning & job platform: courses (video lessons + quizzes), projects, companies, jobs, interview preparation, certificates, and recruiter workflows.

**Live URLs**
- Client (Next.js): https://job-student-task.vercel.app
- Server API (Express): https://job-student-task.onrender.com
- Health check: https://job-student-task.onrender.com/api/health

---

## Tech Stack

| Layer    | Tech |
|----------|------|
| Client   | Next.js 16 (App Router, Turbopack), React Query, Tailwind CSS v4, shadcn-style UI, better-auth (React client) |
| Server   | Node.js, Express, TypeScript, MongoDB (Mongoose), JWT auth + better-auth (Google OAuth), nodemailer/Resend |
| Deploy   | Vercel (client), Render (server), MongoDB Atlas (M0 free tier) |
| Repo     | https://github.com/sojibahmedshorif25-ai/JOB-STUDENT-TASK |

---

## Roles & Demo Accounts

All seed passwords are `password123`:

| Role      | Email                  | Access |
|-----------|------------------------|--------|
| Admin     | sojibahmedshorif998@gmail.com | Full admin panel, verify certificates (owner-only — restricted via `ADMIN_LOGIN_EMAIL`; password is set by owner, not shared) |
| Student   | sojib@student.dev      | Courses, projects, apply jobs, certificates |
| Recruiter | recruiter1@company.dev | Post/manage jobs, view applicants |

---

## Features

- **Auth**: email/password register+login (JWT), Google OAuth (better-auth), forgot/reset password, role-based guards
- **Student**: browse & enroll courses, video lessons, quizzes with pass/fail, notes, progress tracking, certificates (`/verify`)
- **Admin**: dashboard stats, manage courses/modules/lessons, users, companies, jobs, projects
- **Recruiter**: job CRUD + applications
- **Interview prep**: categories, tips, mock questions
- **REST API**: courses, jobs, projects, companies, enrollments, applications, quiz submit, interview prep, certificates

---

## Local Development

```bash
# Server (port 5000)
cd server
npm install
copy .env.example .env   # fill MONGODB_URI etc.
npm run dev

# Client (port 3000)
cd client
npm install
copy .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

### Env vars — Server (`server/.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=                # MongoDB Atlas / local
JWT_SECRET=                 # any long random string
CLIENT_URL=                 # comma-separated allowed origins, e.g. http://localhost:3000,https://job-student-task.vercel.app
SERVER_URL=                 # base URL of this server, e.g. http://localhost:5000 (or https://job-student-task.onrender.com)
GOOGLE_CLIENT_ID=           # Google OAuth client id
GOOGLE_CLIENT_SECRET=
BETTER_AUTH_SECRET=         # used by better-auth
SMTP_HOST= SMTP_PORT= SMTP_USER= SMTP_PASS=   # optional, nodemailer
RESEND_API_KEY=             # optional, easier alternative (https://resend.com) — takes priority over SMTP
MAIL_FROM=SkillForge <no-reply@skillforge.dev>
```

### Env vars — Client (`client/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:5000/api/auth
```

---

## Production Deploy

### Render (server)
1. New Web Service from repo → root dir `server`, build `npm install && npm run build`, start `npm start`
2. Env vars: same as above. Important:
   - `CLIENT_URL=http://localhost:3000,https://job-student-task.vercel.app`
   - `SERVER_URL=https://job-student-task.onrender.com`
   - `NODE_ENV=production`
3. MongoDB Atlas: add IP allowlist `0.0.0.0/1` **and** `128.0.0.0/1` (free tier blocks `0.0.0.0/0`)

### Vercel (client)
1. Import repo → root dir `client`, framework Next.js
2. Env vars: `NEXT_PUBLIC_API_URL=https://job-student-task.onrender.com/api`, `NEXT_PUBLIC_AUTH_URL=https://job-student-task.onrender.com/api/auth`

---

## Google OAuth — Console Setup (required for live Google login)

At https://console.cloud.google.com → project → **APIs & Services → Credentials** → your OAuth 2.0 Client ID:

**Authorized redirect URIs:**
```
https://job-student-task.onrender.com/api/auth/callback/google
http://localhost:5000/api/auth/callback/google
```

**Authorized JS origins:**
```
https://job-student-task.vercel.app
http://localhost:3000
```

Save → settings may take a few minutes to propagate. Then test Google login on the live site.

---

## Live Verification Checklist

```bash
curl https://job-student-task.onrender.com/api/health                        # db: connected
curl -H "Origin: https://job-student-task.vercel.app" https://job-student-task.onrender.com/api/courses   # check access-control-allow-origin header
```

- [x] CORS for Vercel + localhost origins
- [x] Admin / Student / Recruiter login
- [x] All public data endpoints (courses, jobs, companies, projects, interview)
- [x] Enrollment + progress + quiz submit
- [x] Forgot / reset password flow (email requires SMTP/Resend key, otherwise logged in server console)
- [x] Google OAuth redirect URI (production)
- [ ] Google Console redirect URI saved (user action)
- [ ] SMTP/Resend key for live reset emails (user action)
- [ ] Render env: `ADMIN_LOGIN_EMAIL` + `ADMIN_LOGIN_PASSWORD` (user action — admin login stays owner-only)

---

## Project Structure

```
client/src/app/           # pages (dashboard, courses, jobs, projects, interview-prep, learn, auth, verify)
client/src/components/    # UI + shared components, role guards
client/src/lib/           # api client, auth-client (better-auth)
server/src/config/        # env, better-auth config (auth.ts)
server/src/controllers/   # auth (JWT + Google sync), courses, jobs, projects, companies, interview, etc.
server/src/models/        # Mongoose models
server/src/middlewares/   # auth guard, rate limit
server/src/routes/        # Express routers
server/src/seed.ts        # seed data (npm run seed)
```

---

## Commands

```bash
cd server && npm run seed       # wipe + reseed demo data
cd server && npm run dev        # dev server (tsx watch)
cd server && npm run build && npm start   # production server
cd client && npm run dev        # dev client
cd client && npm run build && npm run lint   # build + lint
```

---

## Notes & Known Limits

- Reset-password email on production is silent until `RESEND_API_KEY` or SMTP is configured (it logs to server console in development).
- Cloudinary upload vars exist but are empty (image uploads fall back to URLs).
- Free Atlas M0: `0.0.0.0/0` blocked — use the `/1` split-IP trick above.
- Optional future features (not implemented): Stripe payments, AI tools, chat, realtime.
