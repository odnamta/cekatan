# Celline's OBGYN Prep

A spaced repetition learning app for OBGYN exam preparation, featuring flashcards, multiple-choice questions, and gamification elements like streaks and study heatmaps.

## Features

- **Spaced Repetition (SM-2)** — Optimized review scheduling based on your performance
- **Flashcards & MCQs** — Support for both card types with markdown rendering
- **Bulk Import** — Create MCQs quickly from PDF source materials
- **Gamification** — Daily streaks, study heatmaps, and progress tracking
- **Dark Mode** — Full dark mode support with WCAG AA contrast compliance
- **Mobile-First** — Responsive design optimized for studying on any device

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + fast-check (property-based testing)
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project ([create one here](https://supabase.com/dashboard))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cellines-obgyn-prep
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project
2. Go to **SQL Editor** and run the contents of `schema.sql` to create all tables and RLS policies
3. Enable Email Auth in **Authentication > Providers**

### 3. Configure Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in your Supabase dashboard under **Settings > API**.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample data |

## Project Structure

```
src/
├── actions/        # Server Actions (mutations)
├── app/            # Next.js App Router pages
├── components/     # React components
│   ├── cards/      # Card creation components
│   ├── course/     # Course hierarchy (WIP)
│   ├── dashboard/  # Dashboard widgets
│   ├── decks/      # Deck management
│   ├── study/      # Study session components
│   └── ui/         # Reusable UI primitives
├── lib/            # Pure functions & utilities
├── types/          # TypeScript type definitions
└── __tests__/      # Property-based tests
```

## Testing

This project uses property-based testing with fast-check to verify correctness properties:

```bash
npm run test
```

Tests cover core algorithms like SM-2 spaced repetition, streak calculation, and session state management.

## License

Private project.
