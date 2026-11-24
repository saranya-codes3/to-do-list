# little.day

> *A little progress every day.*

A calm, minimalist to-do list and daily productivity workspace built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase** (PostgreSQL, Authentication, Row Level Security, and Realtime).

---

## Features

- **Mindful Editorial Workspace**: Warm cream & sage palette (`#FAF7F0`, `#EDE5D8`, `#A3B18A`, `#344E41`, `#FFFDF9`, `#E8CFC8`), paired with **Playfair Display** headings and **Manrope** body typography.
- **Light & Dark Themes**: Switch seamlessly between *Light Cream* and *Dark Forest* modes with persisted user preference.
- **Focused Navigation**:
  - **My Day** — Tasks due today plus overdue items that need attention.
  - **All Tasks** — Full workspace view with search, status tabs, priority/category filters, and sorting.
  - **Upcoming** — Scheduled future tasks.
  - **Completed** — Archive of finished commitments.
  - **Categories** — Visual breakdown and progress per category (`Personal`, `Work`, `Wellness`, `Creative`, `Home`, `Errands`, or custom categories).
  - **Settings** — Theme preference, display name, password update, JSON export, and SQL schema reference.
- **Full CRUD + Real-Time Sync**:
  - Create, edit, toggle completion, and delete tasks (with confirmation dialog).
  - Optimistic UI updates backed by Supabase PostgreSQL and live `postgres_changes` subscriptions.
- **Supabase Authentication & RLS**:
  - Registration, sign-in, password reset via email, protected dashboard, and strict Row Level Security policies so users only access their own tasks.

---

## Project Structure

```text
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── README.md
├── supabase/
│   └── schema.sql          # PostgreSQL table, triggers, RLS policies & realtime setup
└── src/
    ├── components/
    │   ├── ConfirmModal.tsx
    │   ├── Header.tsx
    │   ├── SchemaModal.tsx
    │   ├── SearchBar.tsx
    │   ├── Sidebar.tsx
    │   ├── Statistics.tsx
    │   ├── TaskCard.tsx
    │   └── TaskModal.tsx
    ├── hooks/
    │   └── useTasks.ts
    ├── lib/
    │   └── supabase.ts
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Login.tsx
    │   ├── Register.tsx
    │   └── Settings.tsx
    ├── services/
    │   └── taskService.ts
    ├── styles/
    │   └── global.css
    ├── types/
    │   └── task.ts
    ├── utils/
    │   └── dateUtils.ts
    ├── App.tsx
    └── main.tsx
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd little-day
npm install
```

### 2. Create a Supabase Project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor** in your Supabase dashboard.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it. This creates:
   - The `public.tasks` table (`id`, `user_id`, `title`, `description`, `category`, `priority`, `due_date`, `completed`, `created_at`, `updated_at`)
   - An automatic `updated_at` trigger
   - Row Level Security (RLS) policies scoped to `auth.uid() = user_id`
   - Realtime replication for `public.tasks`
4. Under **Authentication → URL Configuration**, add your local dev URL (e.g. `http://localhost:3000`) and production deployment URL to **Site URL** and **Redirect URLs** so password reset and email confirmation links return to your app.

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your project credentials from **Project Settings → API** in Supabase:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Security Note:** Never commit `.env` or expose your Supabase `service_role` key in client-side code. `.env` is already excluded in `.gitignore`.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev` — Start the Vite development server on port 3000.
- `npm run build` — Build the production bundle to `dist/`.
- `npm run preview` — Preview the production build locally.
- `npm run lint` — Run TypeScript typechecking (`tsc --noEmit`).

---

## Deployment

You can deploy **little.day** as a static SPA to Vercel, Netlify, or Cloudflare Pages:

1. Build command: `npm run build`
2. Output directory: `dist`
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting provider's environment variable settings.
4. Add your deployed domain to **Supabase → Authentication → URL Configuration → Redirect URLs**.
