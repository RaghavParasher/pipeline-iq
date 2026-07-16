# Contributing to PipelineIQ

First off, thank you for considering contributing to **PipelineIQ**! We build with obsessive craft, strict typing, and high visual standards.

## Quick Start & Local Development

1. **Clone the repository & install dependencies:**
   ```bash
   git clone https://github.com/your-username/pipeline-iq.git && cd pipeline-iq
   cp .env.example .env
   npm install
   ```
2. **Configure your Database:**
   Ensure you have a PostgreSQL database running or set up a free database on [Neon](https://neon.tech) / [Supabase](https://supabase.com). Paste your connection string into `.env` under `DATABASE_URL`.
3. **Run Migrations & Seed Demo Data:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```
4. **Start the Development Server:**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

## Development Standards & Hard Rules

- **Strict TypeScript (`no any, ever`):** Every function, DTO, and database query must have explicit types.
- **Shared Zod Schemas:** If adding or modifying form inputs or API payloads, update the shared Zod contracts in `src/lib/validators.ts`.
- **UI & Accessibility:** All interactive components must support keyboard navigation (`Tab` order, `Cmd+K` palette, visible focus ring) and WCAG AA color contrast (`≥4.5:1`).
- **All 4 Async States:** Any new route or component fetching data must design and render **Loading** (Skeletons without CLS), **Empty** (with a primary CTA), **Error** (friendly user message + retry), and **Success** states.

## Commit Style (Conventional Commits)

Please write clean, atomic commits:
- `feat:` for new features (e.g., `feat: add optimistic card reordering on kanban drop`)
- `fix:` for bug fixes (e.g., `fix: resolve timezone conversion bug in expected close date`)
- `docs:` for documentation updates
- `refactor:` for code restructuring without changing external behavior

## Opening a Pull Request

1. Rebase on `main` before opening your PR (`git pull --rebase origin main`).
2. Run `npm run lint` and `npm run build` locally to verify there are no TypeScript or build errors.
3. Include a clear description answering: *"What changed and why?"* along with a screen recording or screenshot of the UI change.
