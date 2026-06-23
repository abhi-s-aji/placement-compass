# Placement Compass

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://placement-compass.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/abhi-s-aji/placement-compass)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

---

## Live Application

Access the platform here:  
**[Placement Compass](https://placement-compass.vercel.app)**

---

## Overview

Placement Compass is a full-stack, AI-powered placement preparation platform designed to help college students systematically track, evaluate, and improve their career readiness.

It provides structured evaluation across core skill areas, real-time scoring systems, AI-generated improvement roadmaps, and a multi-role ecosystem involving students, mentors, and administrators.

The platform combines deterministic evaluation logic, AI assistance (Google Gemini), and mentor-driven feedback to create a continuous improvement cycle for placement preparation.

---

## Problem Statement

Most students preparing for placements face challenges such as:

- Lack of structured preparation tracking
- No clear visibility into skill gaps
- No centralized system for progress monitoring
- Limited mentor feedback and guidance

Placement Compass solves this by building a unified and structured preparation ecosystem.

---

## Core Objective

To build an intelligent placement preparation system that:

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
- Dynamic scoring engine with real-time updates
- GitHub profile integration and repository analysis
- Projects portfolio with GitHub and live demo support
- AI-generated readiness reports:
  - Strength analysis
  - Weakness identification
  - Root cause breakdown
  - 30-day improvement roadmap
- Resume builder with structured sections and export support
- Mock interview system covering:
  - DSA fundamentals
  - System design basics
  - OS, DBMS, networking
  - Behavioral questions
- Certificate management system
- Mentor request system
- Task and todo management system
- Mentor feedback tracking system

---

### Mentor Features

- Cohort-level analytics dashboard
- Mentee performance tracking system
- Student filtering and search tools
- Individual student deep-dive profiles
- Task assignment system with priority and deadlines
- Feedback and learning recommendations
- Direct communication system

---

### Admin Features

- User management system (students, mentors, admins)
- Mentor request approval workflow
- Invite code management system
- Platform-wide analytics dashboard
- Cohort and department-level tracking
- System monitoring and control tools

---

## System Architecture

- Next.js App Router for frontend + backend routing
- Supabase for authentication, database, and RLS security
- Server Actions for backend operations
- Google Gemini API for AI-driven insights
- Deterministic scoring engine for evaluation
- Hybrid fallback system using local JSON storage
- Resume parsing system (PDF + DOCX support)

---

## Tech Stack

- Next.js 16 (App Router)
- React
- TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- Google Gemini API
- GSAP (animations)
- Motion (UI transitions)
- pdf-parse
- mammoth

---

## Architecture Flow

1. Student data collected via dashboard checklists  
2. Deterministic engine calculates category scores  
3. Supabase stores structured user data  
4. Gemini generates AI insights and roadmap  
5. Mentor feedback is integrated into profiles  
6. Admin monitors system-wide analytics  

---

## Deployment

- Hosted on Vercel  
- Supabase backend (PostgreSQL + Auth)  
- External APIs: GitHub + Gemini  

No installation required — use live link above.

---

## Environment Variables

- Supabase project credentials  
- Supabase anon + service keys  
- Google Gemini API key  
- GitHub token (for profile analysis)  
- App URL configuration  

---

## Contributors

### Ajay S A

[![GitHub](https://img.shields.io/badge/GitHub-Cyberbeerus-black?logo=github)](https://github.com/Cyberbeerus)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?logo=linkedin)](https://www.linkedin.com/in/ajay-s-a-281208359)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail)](mailto:ajayakshay705@gmail.com)

---

### Akshay S A

[![GitHub](https://img.shields.io/badge/GitHub-Akshaysa11-black?logo=github)](https://github.com/Akshaysa11)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?logo=linkedin)](https://www.linkedin.com/in/akshay-s-a-260230329)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail)](mailto:akshaysajay949@gmail.com)

---

### Asana S

[![GitHub](https://img.shields.io/badge/GitHub-Asansafi1179-black?logo=github)](https://github.com/Asansafi1179)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?logo=linkedin)](https://www.linkedin.com/in/asana-s-a81342333)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail)](mailto:asansafi1179@gmail.com)

---

### Abhi S Aji

[![GitHub](https://img.shields.io/badge/GitHub-abhi--s--aji-black?logo=github)](https://github.com/abhi-s-aji)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-blue?logo=linkedin)](https://www.linkedin.com/in/abhi-s-aji-008445267)
[![Email](https://img.shields.io/badge/Email-Contact-red?logo=gmail)](mailto:abhisajieden@gmail.com)

---

## License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this project with attribution.