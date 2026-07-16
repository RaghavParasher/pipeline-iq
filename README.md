# PipelineIQ — Enterprise B2B Deal Pipeline & Revenue Forecasting

> High-density Kanban deal pipeline with weighted revenue forecasting, row-level RBAC, optimistic UI drag-and-drop, and an AI DealRisk Copilot for modern B2B sales teams.

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## 🚀 Live Demo

**URL:** [Coming soon — deploy to Vercel](#deployment)

| Account | Email | Password | Role |
|---|---|---|---|
| Demo Admin | `demo@demo.com` | `demo1234` | ADMIN (full CRUD) |
| Sales Manager | `manager@demo.com` | `demo1234` | MANAGER |
| Account Executive | `rep@demo.com` | `demo1234` | REP (own deals only) |

---

## ✨ Features

- **Kanban Pipeline** — Drag-and-drop deals across stages with optimistic UI updates and rollback toasts on error (powered by `dnd-kit`)
- **Weighted Forecasting** — Each column header shows `Stage Total × Default Probability%` in real-time
- **Dense Deals Table** — Sortable multi-column table with debounced server-side search (`~300ms`), URL-mirrored filters (`?query=&stageId=&status=`), and cursor pagination
- **Deal Detail Drawer** — Slide-over with linked contacts, notes with autosave, and immutable `ActivityLog` audit trail
- **AI DealRisk Copilot** — One-click deal stall analysis (powered by heuristics + Gemini) scoring deals 0–100 with actionable recommendations
- **Row-Level RBAC** — `ADMIN → MANAGER → REP → VIEWER` enforced at both middleware and server action level
- **Global Command Palette** — `Cmd/Ctrl+K` keyboard-driven search across deals and navigation
- **System-Aware Dark Mode** — Elevates surfaces with lightness, desaturated accents, capped white text opacity
- **Full SEO** — OpenGraph, JSON-LD, sitemap, robots.txt, semantic HTML, WCAG AA contrast

---

## 🏗 Architecture

```
pipeline-iq/
├── prisma/
│   ├── schema.prisma         # Full data model (8 entities)
│   └── seed.ts               # Demo org, 25 deals, 3 role accounts
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Sign-in page with 1-click demo login
│   │   └── (dashboard)/
│   │       ├── pipeline/     # Kanban board route
│   │       ├── deals/        # Dense table route
│   │       └── analytics/    # Revenue forecasting route
│   ├── components/
│   │   ├── pipeline/         # KanbanBoard, DealCard
│   │   ├── deals/            # DealDrawer, CreateDealModal
│   │   ├── layout/           # Sidebar, Header
│   │   └── ui/               # Button, Card, Badge, Skeleton, Input...
│   ├── lib/
│   │   ├── auth.ts           # Auth.js + bcrypt credentials
│   │   ├── db.ts             # Prisma singleton with PrismaPg adapter
│   │   ├── utils.ts          # cn(), formatCurrency(), formatDate()
│   │   └── validators.ts     # Shared Zod schemas
│   ├── server/actions/
│   │   ├── deals.ts          # CRUD + stage updates + notes + audit log
│   │   ├── analytics.ts      # Weighted forecasting aggregations
│   │   └── ai.ts             # DealRisk Copilot server action
│   ├── types/index.ts        # TypeScript interfaces + DTOs
│   └── middleware.ts         # Route protection + RBAC enforcement
├── prisma.config.ts          # Prisma v7 config
├── .env.example              # All required environment variables documented
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE                   # MIT
```

**Database ERD:**
```
Organization → Users, PipelineStages, Accounts
User → Deals (owner), ActivityLogs (actor), DealNotes (author)
PipelineStage → Deals
Account → Contacts, Deals
Deal → ActivityLogs, DealNotes, DealRiskAnalysis (1:1)
```

---

## 🛠 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (free options: [Neon](https://neon.tech) or [Supabase](https://supabase.com))

### 1. Clone & Install
```bash
git clone https://github.com/RaghavParasher/pipeline-iq.git
cd pipeline-iq
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/pipeline_iq?schema=public"
AUTH_SECRET="your-32-char-random-secret-here"
AUTH_URL="http://localhost:3000"
GEMINI_API_KEY="optional-for-ai-feature"
```

### 3. Set Up Database & Seed Demo Data
```bash
npm run db:push     # Apply schema to your database
npm run db:seed     # Populate demo org, 25 deals, 3 user accounts
```

### 4. Start Development Server
```bash
npm run dev
# Open http://localhost:3000
# Sign in with demo@demo.com / demo1234
```

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push repo to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (from `.env.example`)
4. After first deploy, run `npm run db:seed` against your production database

---

## 🧪 Testing

```bash
npm run type:check    # TypeScript strict mode validation
npm run lint          # ESLint check
npm run build         # Production build validation
```

---

## 📄 License

MIT — see [LICENSE](./LICENSE)
