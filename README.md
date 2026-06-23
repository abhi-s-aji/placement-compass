# Placement Compass

Live Demo: https://placement-compass.vercel.app

---

## Overview

Placement Compass is a full-stack, AI-powered placement preparation platform designed to help college students systematically track, evaluate, and improve their career readiness.

It provides structured evaluation across core skill areas, real-time scoring systems, AI-generated improvement roadmaps, and a multi-role ecosystem involving students, mentors, and administrators.

The platform combines deterministic evaluation logic, AI assistance (Google Gemini), and mentor-driven feedback to create a continuous improvement cycle for placement preparation.

---

## Problem Statement

Most students preparing for placements struggle with:

- Lack of structured preparation tracking
- No clear understanding of skill gaps
- No centralized system for progress monitoring
- Limited mentor guidance and feedback loops

Placement Compass solves this by building a unified ecosystem that continuously evaluates and improves student readiness.

---

## Core Objective

To provide a structured, intelligent, and scalable placement preparation system that:

- Tracks student readiness across multiple skill dimensions
- Provides actionable improvement plans
- Enables mentor-guided learning workflows
- Offers admin-level control and analytics

---

## Evaluation Dimensions

Students are evaluated across 7 key dimensions:

- Resume quality
- GitHub profile strength
- LinkedIn optimization
- Project quality and implementation depth
- Coding skills
- Aptitude performance
- Interview readiness

Each dimension contributes to a unified placement readiness score.

---

## Features

### Student Features

- Real-time placement readiness dashboard
- Category-wise performance breakdown
- Interactive checklist-based progress tracking
- Dynamic score recalculation engine
- GitHub profile integration and repository analysis
- Projects portfolio with GitHub and live demo support
- AI-generated readiness reports including:
  - Strength analysis
  - Weakness identification
  - Root cause breakdown
  - 30-day structured improvement roadmap
- Resume builder with structured sections and print-ready output
- Mock interview system covering:
  - DSA fundamentals
  - System design basics
  - OS, DBMS, and networking concepts
  - Behavioral interview questions
- Certificate management system
- Mentor request and mapping system
- Task and todo management system
- Mentor feedback tracking system

---

### Mentor Features

- Cohort-level analytics dashboard
- Mentee performance tracking system
- Student filtering and search tools
- Individual student deep-dive profiles
- Task assignment system with priority and deadlines
- Feedback and learning recommendations system
- Direct communication with students

---

### Admin Features

- Complete user management system (students, mentors, admins)
- Mentor request approval workflow
- Invite code generation and management system
- Platform-wide analytics dashboard
- Cohort and department-level performance tracking
- System monitoring and oversight tools

---

## System Architecture

Placement Compass is built using a modern full-stack architecture:

- Next.js App Router for frontend and backend routing
- Supabase for authentication, database, and Row Level Security (RLS)
- Server Actions for secure backend mutations
- Google Gemini API for AI-driven insights and reports
- Deterministic scoring engine for consistent evaluation
- Hybrid fallback system using local JSON storage
- Resume parsing system using PDF and DOCX support (partially integrated)

---

## Tech Stack

- Next.js 16 (App Router)
- React
- TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- Google Gemini API
- GSAP (animations)
- Motion (UI transitions)
- pdf-parse (resume parsing)
- mammoth (DOCX parsing)

---

## Key Engineering Highlights

- Role-based access control using Supabase Row Level Security (RLS)
- AI-powered placement readiness scoring system
- Deterministic evaluation engine for consistent results
- Hybrid offline fallback system using local JSON storage
- Server Actions for secure backend workflows
- Modular resume parsing system (PDF and DOCX support)
- Scalable App Router-based architecture
- Real-time progress tracking system

---

## Architecture Flow

1. Student data is collected via dashboards and checklists  
2. Deterministic engine calculates category-wise scores  
3. Supabase stores user progress and metadata securely  
4. Gemini API generates AI-based insights and roadmaps  
5. Mentor feedback is integrated into student profiles  
6. Admin monitors system-wide analytics and user activity  

---

## Deployment

Placement Compass is fully deployed and production-ready.

- Hosted on Vercel
- Supabase backend (PostgreSQL + Auth)
- External API integrations (GitHub, Gemini)

No local installation is required — access directly via live URL.

---

## Environment Variables

The system internally uses:

- Supabase project credentials
- Google Gemini API key
- GitHub API token (for profile analysis)
- Application URL configuration

---

## Contributors

Ajay S A — Cyberbeerus  
GitHub: https://github.com/Cyberbeerus  
Email: ajayakshay705@gmail.com  
LinkedIn: https://www.linkedin.com/in/ajay-s-a-281208359  

Akshay S A — Akshaysa11  
GitHub: https://github.com/Akshaysa11  
Email: akshaysajay949@gmail.com  
LinkedIn: https://www.linkedin.com/in/akshay-s-a-260230329  

Asana S — Asansafi1179  
GitHub: https://github.com/Asansafi1179  
Email: asansafi1179@gmail.com  
LinkedIn: https://www.linkedin.com/in/asana-s-a81342333  

Abhi S Aji — abhi-s-aji  
GitHub: https://github.com/abhi-s-aji  
Email: abhisajieden@gmail.com  
LinkedIn: https://www.linkedin.com/in/abhi-s-aji-008445267  

---

## License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this project with attribution.