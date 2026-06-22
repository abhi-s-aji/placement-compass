# Placement Compass

Placement Compass is a production-ready, feature-rich web application built on Next.js 16 (App Router), Supabase (Auth + PostgreSQL), and the Google Gemini API. It is designed to help students measure preparation progress, identify skill gaps, and improve with personalized AI-driven guidance and mentor/admin oversight.

---

## Key Features

### 🎓 For Students
1. **Interactive Dashboard**: Displays overall placement readiness score, category breakdowns, assigned mentor tasks, recent AI report cards, and feedback log.
2. **Checklist & Score Engine**: Interactive checklists for Resume, GitHub, LinkedIn, Projects, Coding, Aptitude, and Interviews. Toggling items updates scores in real-time.
3. **Projects Management**: Complete CRUD operations for projects, including technology tags, live demo links, and GitHub links.
4. **GitHub Portfolio Sync**: Syncs public repositories, followers, stars, and calculates a dynamic portfolio score via the GitHub REST API.
5. **Gemini AI Readiness Report**: Generates strengths, weaknesses with root causes, high-priority suggestions, and a week-by-week 30-day action plan.

### 👨‍🏫 For Mentors
1. **Cohort Overview**: High-level cohort statistics (average score, total mentees, students needing support, pending tasks).
2. **Mentees Directory**: Searchable list of students with filters for departments, graduation year, and score ranges.
3. **Student Profile Review**: View a student's full checklist status, repository details, projects, task history, and past feedback.
4. **Task Console**: Assign tasks with categories, priorities (Low, Medium, High, Urgent), and deadlines.
5. **Feedback Console**: Write focus-specific or general feedback logs to any student.

### 🔑 For Admins
1. **Analytics Dashboard**: Cohort distribution metrics and average scores by department/graduation year.
2. **User Management**: View all registered users (Students, Mentors, Admins), activate/deactivate accounts, and update user roles.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database / Auth**: Supabase (PostgreSQL, Row Level Security, Auth triggers)
- **AI Engine**: Google Gemini API SDK (`@google/generative-ai`)
- **Styling**: Pure CSS design system (Linear/Stripe-inspired layout, dark theme, smooth micro-animations)
- **Language**: TypeScript

---

## Getting Started

### 1. Database Setup (Supabase)
Create a new project at [Supabase](https://supabase.com). Go to the **SQL Editor** in the Supabase Dashboard and run the SQL migration script located in this repository at:
`supabase/migrations/001_initial_schema.sql`

This script will:
- Create all database tables (`profiles`, `projects`, `progress`, `checklist_items`, `github_data`, `tasks`, `feedback`, `ai_reports`).
- Configure Row Level Security (RLS) policies for secure client-side queries.
- Register database triggers for automatic user creation handling and updated timestamp management.

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the required keys:
- **Supabase credentials**: Get these from your Supabase Project Settings -> API.
- **Gemini API Key**: Create a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
- **GitHub Token (Optional)**: A personal access token to bypass public API rate limits (recommended for production).

### 3. Run the Development Server
Install dependencies and run the development server:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access Placement Compass.

---

## Project Structure
```
placement-compass/
├── app/                          # Next.js App Router Pages & Layouts
│   ├── (auth)/                   # Authentication pages (login/register)
│   ├── (dashboard)/              # Protected workspace layouts
│   │   ├── student/              # Student dashboard & feature pages
│   │   ├── mentor/               # Mentor dashboard & feature pages
│   │   └── admin/                # Admin analytics & settings pages
│   └── api/                      # Backend endpoints (Gemini analysis, GitHub sync)
├── components/                   # Reusable UI component blocks
├── lib/                          # Helper functions, scoring, and Supabase SDK configs
├── middleware.ts                 # Layout protection & role routing middleware
├── supabase/
│   └── migrations/               # PostgreSQL schema structure files
└── public/                       # Assets & media files
```
