<div align="center">

# 🎓 SkillForge — Full-Stack Learning & Career Recruitment Platform

### *Empowering Students, Connecting Recruiters, Accelerating Tech Careers*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![Live Demo](https://img.shields.io/badge/Live_Client-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://job-student-task.vercel.app)
[![Server API](https://img.shields.io/badge/Server_API-Render-4D6E4F?style=flat-square&logo=render&logoColor=white)](https://job-student-task.onrender.com)
[![API Docs](https://img.shields.io/badge/API_Docs-Interactive-purple?style=flat-square&logo=swagger)](https://job-student-task.vercel.app/api-docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## 🌐 Live Deployments & API Explorer

- **Production Client (Next.js 16):** [https://job-student-task.vercel.app](https://job-student-task.vercel.app)
- **Production Server (Express API):** [https://job-student-task.onrender.com](https://job-student-task.onrender.com)
- **Interactive REST API Reference:** [https://job-student-task.vercel.app/api-docs](https://job-student-task.vercel.app/api-docs)
- **System Health Check:** [https://job-student-task.onrender.com/api/health](https://job-student-task.onrender.com/api/health)
- **GitHub Repository:** [https://github.com/sojibahmedshorif25-ai/JOB-STUDENT-TASK](https://github.com/sojibahmedshorif25-ai/JOB-STUDENT-TASK)

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend Layer (Next.js 16 App Router)"]
        UI["Modern UI (Tailwind CSS v4 + Radix)"]
        RQ["TanStack React Query (Cached State)"]
        SANDBOX["In-Browser Coding Sandbox"]
        AI_INT["AI Interview Evaluator & ATS Scanner"]
        PORTFOLIO["Public Candidate Portfolio (/u/:id)"]
    end

    subgraph API["Backend Layer (Node.js & Express + TypeScript)"]
        AUTH["Auth Service (JWT + Google OAuth 2.0)"]
        GUARD["RBAC Security & Rate Limiting"]
        CACHE["High-Performance HTTP Caching"]
        ROUTERS["40+ REST API Endpoints"]
        TESTS["Automated Test Runner"]
    end

    subgraph DB["Database & Cloud Services"]
        MONGO[("MongoDB Atlas (Mongoose ODM)")]
        EMAIL["Nodemailer & Resend API"]
        LINKEDIN["LinkedIn Certification API"]
    end

    Client <-->|HTTPS / REST API| API
    API <-->|Mongoose Models| MONGO
    API -->|Email Dispatch| EMAIL
    Client -->|1-Click Share| LINKEDIN
```

---

## 👥 Demo Accounts & Role-Based Access Control (RBAC)

Seed credentials:

| Role | Demo Email | Access Capabilities |
|:---|:---|:---|
| **Admin** | `sojibahmedshorif25@gmail.com` | Full platform control, user management, metrics, course oversight (Owner account). |
| **Student** | `sojib@student.dev` | Enroll courses, video player, quizzes, AI mock interviews, ATS resume builder, certificates, job applications (`password123`). |
| **Recruiter** | `recruiter1@company.dev` | Post jobs, candidate pipelines, interview scheduling, applicant management (`password123`). |

> **Real Google Login:** Anyone with a real Google/Gmail account can sign in with 1-click via the "Continue with Google" button!

---

## ✨ Enterprise Feature Highlights

### 🎓 1. Learning & Certification Engine
- **Curriculum Player:** Video lessons, module progress tracking, markdown notes, and auto-progression.
- **Automated Quiz Engine:** Real-time scoring and instant pass/fail validation.
- **Cryptographic Certificate Verification:** Public verify endpoint (`/verify/:id`) with authentic credential ID and tamper-proof verification.
- **1-Click LinkedIn Certificate Share:** Instant addition of verified credentials into LinkedIn candidate profiles with pre-filled certification metadata.
- **Print & PDF Export:** Clean print-media layout for certificate printing.

### 🤖 2. AI Career & Interview Tools
- **AI Mock Interview Simulation:** Timed technical mock interviews with algorithmic scoring across Accuracy, Terminology, Depth, and Clarity.
- **AI ATS Resume Scanner & Optimizer:** Live ATS compatibility index (0-100%), missing keyword highlights, and impact action-verb suggestions.
- **Interactive Coding Sandbox:** Live in-browser JavaScript code editor with real-time test-case assertion execution and console output capture.
- **SkillBot AI Assistant:** Floating interactive AI tutor across the platform.

### 💼 3. Recruitment & Job Pipeline
- **Job Board:** Advanced filtering (remote, full-time, salary ranges, required skill tags).
- **Recruiter Dashboard:** Post jobs, view candidate pipeline, review resumes, and track candidate status (Applied, Interviewing, Offered, Rejected).
- **Public Developer Portfolio (`/u/:id`):** Sharable candidate profile showcasing verified certificates, projects, and direct "Hire Me" contact modal.

---

## 🗄️ Database Schema & Entity Relationships

```mermaid
erDiagram
    USER ||--o{ ENROLLMENT : has
    USER ||--o{ APPLICATION : submits
    USER ||--o{ CERTIFICATE : earns
    USER ||--o{ RESUME : builds
    COURSE ||--o{ ENROLLMENT : contains
    COURSE ||--o{ CERTIFICATE : issues
    JOB ||--o{ APPLICATION : receives
    COMPANY ||--o{ JOB : posts

    USER {
        string _id
        string name
        string email
        string role "STUDENT | RECRUITER | ADMIN"
        string avatar
    }
    COURSE {
        string _id
        string title
        string level
        number price
        array modules
    }
    CERTIFICATE {
        string certificateId
        date issueDate
        objectId user
        objectId course
    }
    JOB {
        string _id
        string title
        string salary
        string location
        array skills
    }
```

---

## 🚀 Quickstart & Local Development

### Option A: 1-Command Startup with Docker Compose
```bash
docker-compose up --build
```
- Client running on: `http://localhost:3000`
- Server API running on: `http://localhost:5000`
- MongoDB running on: `mongodb://localhost:27017`

---

### Option B: Standard NPM Setup

#### 1. Backend Server Setup (Port 5000)
```bash
cd server
npm install
copy .env.example .env     # Configure MONGODB_URI and JWT_SECRET
npm run seed              # Seed initial courses, jobs, and demo users
npm run dev               # Starts tsx watch server
```

#### 2. Frontend Client Setup (Port 3000)
```bash
cd client
npm install
copy .env.example .env.local
npm run dev               # Starts Next.js Turbopack dev server
```

---

## 🧪 Automated Testing & Quality Assurance

```bash
# Run backend automated integration tests
cd server
npm test

# Run TypeScript typechecks
cd server && npm run typecheck
cd client && npm run build
```

---

## 💼 CV & Interview Guide

For resume bullet points, quantifiable metrics, and answers to high-frequency technical interview questions about this project, refer to **[`CV_PORTFOLIO_GUIDE.md`](./CV_PORTFOLIO_GUIDE.md)**.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). Built by **Sojib Ahmed Shorif**.
