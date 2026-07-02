# AbroadSync

AbroadSync is a professional, high-performance CRM built specifically for student recruitment agencies and educational consultancies. Unlike generic sales CRMs, AbroadSync is designed around the lifecycle of study abroad applicants—tracking detailed academic histories, language test scores, target study levels, intake preferences, and managing multiple university applications per student.

## Features

- **360° Student Profiles:** Manage SSC/HSC grades, bachelor/master degrees, English test types (IELTS, PTE, TOEFL, Duolingo) and scores, budgets, and preferred study destinations.
- **Multi-University Applications:** Track status and progress of multiple university applications for a single student profile simultaneously.
- **Timeline & Collaboration:** Centralize counselor logs, comments, and file statuses (like "File Opened" conversions) in a chronological feed.
- **Task Management:** Real-time follow-up task lists, with a timezone-aware client-side agenda filtering logic.
- **Optimistic UI & Client Caching:** Integrated with SWR for near-zero latency transitions, instant checkbox toggles, and seamless listing updates.
- **Role-Based Permissions:** Multi-tenant architecture supporting Super Admins, Managers, and Counselors with row-level security (RLS).
- **One-Click Exports:** Generate clean, branded PDF summaries of student profiles for partner university submissions.

## Tech Stack

- **Framework:** Next.js (App Router, Server Actions)
- **Database & Auth:** Supabase (PostgreSQL, GoTrue)
- **State & Caching:** SWR (Stale-While-Revalidate)
- **Styling:** Tailwind CSS (Modern Glassmorphism Theme)
- **Icons:** Lucide React

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/imabir17/Abroad_Sync.git
cd Abroad_Sync
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Migration & Security Setup
Run the following SQL scripts in your Supabase SQL Editor:
1. `supabase_schema.sql` — Initializes database tables and relations.
2. `supabase_rls_policies.sql` — Configures Row-Level Security (RLS) policies and session metadata handlers.
3. `performance_indexes.sql` — Configures indexing on foreign key constraints for fast database query lookups.

### 4. Install dependencies and start development server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Production Deployments

When deploying to platforms like **Vercel**, ensure the following configurations are set up:
1. Deploy your serverless functions close to your Supabase primary database (e.g. **Singapore (sin1)** for South Asian users) to minimize database roundtrip latency.
2. Configure **Site URL** and **Redirect URLs** under Supabase Auth Dashboard settings pointing to your production domain.
