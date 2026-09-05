<div align="center">

# 🎓 SkillForge — Learning & Job Platform

### *Empowering Students, Connecting Recruiters*

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://job-student-task.vercel.app)
[![Server API](https://img.shields.io/badge/Server_API-Render-4D6E4F?style=for-the-badge&logo=render&logoColor=white)](https://job-student-task.onrender.com)

</div>

---

## 📖 Overview

**SkillForge** is a comprehensive full-stack learning and job platform featuring courses with video lessons & quizzes, project showcases, company profiles, job listings, interview preparation, certificate generation, and recruiter workflows. Built with role-based access for **Students**, **Recruiters**, and **Admins**.

---

## ✨ Key Features

### 🎓 For Students
| Feature | Description |
|---------|-------------|
| 📚 **Course Catalog** | Browse courses by category, level & price |
| 🎥 **Video Lessons** | In-browser learning player |
| 📝 **Quizzes** | Test knowledge with auto-grading |
| 🏆 **Certificates** | Earn certificates on course completion |
| 💼 **Job Board** | Browse & apply to jobs |
| 💾 **Save Jobs** | Bookmark interesting opportunities |
| 📁 **Projects** | Showcase your work |
| 🎤 **Interview Prep** | Practice with question bank |

### 👔 For Recruiters
| Feature | Description |
|---------|-------------|
| 🏢 **Company Profile** | Create & manage company page |
| 📋 **Job Posting** | Post jobs with detailed requirements |
| 👥 **Applicant Tracking** | Review applications (Applied → Shortlisted → Interview → Offer) |
| 📅 **Interview Scheduling** | Schedule interviews with meeting links |
| ⭐ **Feedback System** | Rate candidates with detailed feedback |

### 🔧 For Admin
| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Platform-wide analytics |
| 👤 **User Management** | View, activate/deactivate users |
| 📚 **Course Management** | Create, edit, delete courses |
| ✅ **Company Verification** | Verify company profiles |
| 📈 **Reports** | Detailed platform reports |

---

## 🛠️ Tech Stack

### Client

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | App Router + Turbopack |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **TanStack Query v5** | Server state management |
| **React Hook Form + Zod** | Form handling & validation |
| **better-auth** | Google OAuth integration |
| **Radix UI** | Accessible primitives (14 components) |
| **next-themes** | Dark/light mode |

### Server

| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | HTTP framework |
| **TypeScript** | Type safety |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT + bcryptjs** | Authentication & hashing |
| **better-auth** | Google OAuth |
| **Nodemailer / Resend** | Email service |
| **Helmet** | Security headers |
| **Morgan** | HTTP logging |
| **express-rate-limit** | Rate limiting |

---

## 📁 Project Structure

```
JOB-STUDENT-TASK/
├── client/                              # 🎨 Next.js 16 Frontend
│   └── src/
│       ├── app/                         # App Router pages
│       │   ├── (auth)/                  # Login, Register, Forgot/Reset Password
│       │   ├── admin/                   # Admin dashboard
│       │   ├── auth/callback/           # Google OAuth callback
│       │   ├── companies/               # Company listings
│       │   ├── courses/                 # Course catalog & detail
│       │   ├── dashboard/               # Student/recruiter dashboard
│       │   ├── interview-prep/          # Interview preparation
│       │   ├── jobs/                    # Job listings & detail
│       │   ├── learn/[courseId]/        # Course learning player
│       │   ├── projects/                # Project showcase
│       │   ├── recruiter/               # Recruiter job management
│       │   ├── verify/[id]/             # Certificate verification
│       │   ├── layout.tsx
│       │   └── page.tsx                 # Homepage
│       ├── components/                  # Reusable UI components
│       ├── contexts/                    # React contexts
│       ├── lib/                         # API client, auth-client
│       └── types/                       # TypeScript types
│
├── server/                              # ⚙️ Express + TypeScript Backend
│   └── src/
│       ├── config/                      # env, database, auth config
│       ├── controllers/                 # 13 route controllers
│       ├── middlewares/                  # auth, error, rateLimit, validate
│       ├── models/                      # 16 Mongoose schemas
│       ├── routes/                      # 13 route files
│       ├── services/                    # mail, notification, slug
│       ├── utils/                       # token, catchAsync, AppError
│       ├── validators/                  # Zod schemas
│       ├── app.ts                       # Express app setup
│       ├── server.ts                    # Server entry
│       └── seed.ts                      # Database seeder
│
└── README.md
```

---

## 🗃️ Database Models

| Model | Description |
|-------|-------------|
| **User** | Users with roles (Student/Recruiter/Admin), skills, resume |
| **Company** | Company profiles with social links, verification |
| **Course** | Courses with modules, lessons, quizzes |
| **Enrollment** | Student course progress tracking |
| **Job** | Job listings with filters |
| **Application** | Job applications with status pipeline |
| **Certificate** | Course completion certificates |
| **Interview** | Scheduled interviews with feedback |
| **InterviewQuestion** | Question bank by category/difficulty |
| **InterviewProgress** | User progress on questions |
| **Notification** | In-app notifications |
| **Project** | Student project showcase |
| **Resume** | User resume data |
| **Review** | Course reviews |
| **SavedJob** | Bookmarked jobs |

---

## 📡 API Endpoints

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (Student/Recruiter) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google OAuth |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

</details>

<details>
<summary><b>📚 Courses</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/filters` | Filter options |
| GET | `/api/courses/:id` | Course detail |
| POST | `/api/courses` | Create course (Admin) |
| POST | `/api/courses/:id/reviews` | Add review |

</details>

<details>
<summary><b>💼 Jobs</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/filters` | Filter options |
| POST | `/api/jobs` | Post job (Recruiter) |
| POST | `/api/jobs/:id/save` | Save job (Student) |
| POST | `/api/jobs/:id/toggle` | Toggle status (Recruiter) |

</details>

<details>
<summary><b>📋 Applications</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/job/:id` | Apply (Student) |
| GET | `/api/applications/my` | My applications |
| GET | `/api/applications/recruiter` | Recruiter applications |
| PUT | `/api/applications/:id/status` | Update status |

</details>

<details>
<summary><b>📊 Admin</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/analytics` | Analytics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/status` | Activate/deactivate |
| PUT | `/api/admin/companies/:id/verify` | Verify company |

</details>

---

## 👥 Role-Based Access

| Feature | Student | Recruiter | Admin |
|---------|:-------:|:---------:|:-----:|
| Browse courses & jobs | ✅ | ✅ | ✅ |
| Enroll in courses | ✅ | ❌ | ❌ |
| Submit quizzes & earn certificates | ✅ | ❌ | ❌ |
| Apply to jobs | ✅ | ❌ | ❌ |
| Save/bookmark jobs | ✅ | ❌ | ❌ |
| Create projects | ✅ | ❌ | ✅ |
| Post/manage jobs | ❌ | ✅ | ✅ |
| Manage applications | ❌ | ✅ | ✅ |
| Schedule interviews | ❌ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ✅ |
| Verify companies | ❌ | ❌ | ✅ |
| Manage courses | ❌ | ❌ | ✅ |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0
- **MongoDB Atlas** account
- **Google Cloud** OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/sojibahmedshorif25-ai/JOB-STUDENT-TASK.git

# Install Client
cd client && npm install

# Install Server
cd ../server && npm install
```

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillforge
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BETTER_AUTH_SECRET=your_auth_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=noreply@skillforge.com

# Client
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AUTH_URL=http://localhost:5000
```

### Seed Database

```bash
cd server
npm run seed
```

### Run Development

```bash
# Terminal 1 — Client (http://localhost:3000)
cd client && npm run dev

# Terminal 2 — Server (http://localhost:5000)
cd server && npm run dev
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillforge.com | password123 |
| Student | student@skillforge.com | password123 |
| Recruiter | recruiter@skillforge.com | password123 |

---

## 🌐 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | **Vercel** | Root: `client`, Framework: Next.js |
| Backend | **Render** | Root: `server`, Build: `npm install && npm run build` |
| Database | **MongoDB Atlas** | M0 Free tier |

---

## 📊 Seed Data

The seeder creates:
- 👥 **3 Users** — Admin, Student, Recruiter
- 🏢 **10 Companies** — TechNova, CloudPeak, CodeVerse, etc.
- 📚 **10 Courses** — Next.js, JavaScript, React+TS, Node.js, etc.
- 💼 **20+ Jobs** — Frontend, Backend, DevOps, Full Stack, etc.
- 📁 **10 Projects** — DevMatch, CourseForge, SkillSync, etc.
- 🎤 **22 Interview Questions** — Across multiple categories & difficulties

---

## 👨‍💻 Author

**Sojib Ahmed**

[![GitHub](https://img.shields.io/badge/GitHub-sojibahmedshorif25--ai-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sojibahmedshorif25-ai)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sojib_Ahmed-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sojib-ahmed-shorif)

---

<div align="center">

**⭐ Star this repo if you find it impressive!**

</div>
