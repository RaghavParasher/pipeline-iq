<div align="center">
  <h1 align="center">PipelineIQ RevOps</h1>
  <p align="center">
    <strong>Enterprise B2B Deal Pipeline, AI Risk Copilot, and Row-Level RBAC</strong>
  </p>

  <p align="center">
    <a href="https://pipelineiiq.netlify.app/"><img src="https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=white" alt="Neon Postgres" />
  </p>
</div>

<br/>

## 🚀 Live Demo

**Access the live production build here:** [https://pipelineiiq.netlify.app/](https://pipelineiiq.netlify.app/)

*The application features a 1-Click Zero-Friction login button for ease of access, or you can use the manual credentials below:*

| Account Role | Email | Password | Permissions |
|---|---|---|---|
| **System Admin** | `admin@admin.com` | `admin1234` | Full system CRUD, global visibility |
| **Sales Manager** | `manager@demo.com` | `demo1234` | Team oversight, forecast reporting |
| **Account Executive** | `rep@demo.com` | `demo1234` | Row-level restricted to owned deals |

---

## 📖 Overview

**PipelineIQ** is a modern Revenue Operations (RevOps) platform designed to solve the complexities of B2B sales cycles. Built for high-density information display, it provides account executives and sales managers with a real-time, optimistic-UI drag-and-drop Kanban board, weighted revenue forecasting, and an intelligent AI Copilot that assesses deal risk based on pipeline velocity and activity history.

The system is secured by **NextAuth v5** and enforced by strict **Prisma row-level RBAC (Role-Based Access Control)**, ensuring data integrity across multi-tiered sales organizations.

---

## ✨ Core Features

- **Dynamic Kanban Pipeline:** Beautiful, optimistic-UI drag-and-drop interface powered by `@dnd-kit`. Drag deals across stages with zero latency; the backend syncs asynchronously.
- **AI Deal-Risk Copilot:** Every deal is analyzed by a simulated AI model that calculates risk scores, momentum decay, and win probabilities based on historical activity metadata.
- **Enterprise RBAC:** Deep row-level security. Sales Reps can only view and edit their own deals; Managers can oversee their entire team; Admins have full structural access.
- **Weighted Forecasting:** Real-time dashboards calculating total pipeline value vs. weighted probability forecasts.
- **Activity Telemetry:** A comprehensive activity log that tracks stage regressions, value changes, and manual notes for deep audit trails.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Framework** | **Next.js 14** | App Router, Server Actions, Server Components |
| **Language** | **TypeScript** | Strict typing across the entire full-stack boundary |
| **Database** | **PostgreSQL (Neon)** | Serverless Postgres for connection pooling & edge compatibility |
| **ORM** | **Prisma** | Schema migrations, typed client, and `@prisma/adapter-pg` driver |
| **Styling** | **Tailwind CSS** | Custom design tokens, glassmorphism UI, fluid responsive design |
| **Authentication**| **NextAuth.js v5** | Secure credential sessions, protected API routes & middleware |
| **UI Components** | **Radix UI** | Accessible headless primitives wrapped in a custom design system |

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Next.js Client Components] -->|Server Actions| API[Next.js Server Actions]
    Client -->|React Query / Fetch| Route[Next.js Route Handlers]
    
    API --> Middleware[NextAuth Middleware]
    Route --> Middleware
    
    Middleware -->|Verified Session| Prisma[Prisma ORM Client]
    
    Prisma -->|adapter-pg TCP| Neon[(Neon Serverless Postgres)]
    
    subgraph Database Schema
        Neon --> Users
        Neon --> Organizations
        Neon --> Deals
        Neon --> DealRiskAnalyses
        Neon --> ActivityLogs
    end
```

---

## 💻 Local Development Setup

If you wish to run the application locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/RaghavParasher/pipeline-iq.git
cd pipeline-iq
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and configure your keys. You must provide a valid PostgreSQL connection string (we recommend Neon.tech):
```env
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
AUTH_SECRET="generate-a-random-32-character-string"
AUTH_URL="http://localhost:3000"
```

### 4. Push Schema & Seed Database
Synchronize the Prisma schema to your database and run the powerful seeding script to generate an organization, users, and 25 realistic B2B deals:
```bash
npx prisma db push
npm run db:seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Posture

- **Passwords:** Hashed via `bcryptjs` with a cost factor of 12.
- **Sessions:** JWT-based stateless sessions encrypted via `AUTH_SECRET`.
- **Validation:** Total API boundary validation using `Zod` schemas.
- **Middleware:** Next.js Edge Middleware intercepts unauthenticated traffic instantly before rendering.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
