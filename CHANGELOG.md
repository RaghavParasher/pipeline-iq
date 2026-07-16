# Changelog

All notable changes to **PipelineIQ** will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-15
### Added
- **Authentication & RBAC:** Secure Auth.js v5 email/password login with Argon2id/bcrypt hashing, session cookie rotation, and row-level RBAC middleware (`ADMIN`, `MANAGER`, `REP`, `VIEWER`).
- **Kanban Deal Pipeline:** Interactive drag-and-drop deal board using `dnd-kit` with optimistic UI updates and instant rollback toasts on error.
- **Weighted Revenue Forecasting:** Dynamic stage column headers calculating `Stage Value × Default Probability %` and summary KPI cards.
- **Dense Deal Table:** Sortable multi-column table view with debounced trigram search (`~300ms`) and combined `AND` query filters mirrored cleanly into the URL query string.
- **Deal Detail Drawer & Audit Trail:** Slide-over panel detailing linked accounts, contacts, notes, and an immutable chronological `ActivityLog` timeline.
- **Global Command Palette (`Cmd/Ctrl+K`):** Keyboard-driven search and navigation across deals, accounts, and stages.
- **AI DealRisk Copilot:** Automated risk assessment using Google Gemini to analyze deal stall times and activity gaps, outputting actionable sales recommendations.
- **Demo Data & Seeding:** Automated `seed.ts` script provisioning `"Acme RevOps Inc."`, pipeline stages, 25 realistic deals, and read-only demo credentials (`demo@demo.com` / `demo1234`).
- **SEO & Discoverability:** Full OpenGraph tags, dynamic 1200x630 `opengraph-image.png`, `sitemap.xml`, `robots.txt`, and `SoftwareApplication` JSON-LD structured data.
