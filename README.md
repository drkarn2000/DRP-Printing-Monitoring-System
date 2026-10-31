# DRP Printing Monitoring System
## Complete Production Development Implementation (v2.0)

A fully functional, database-driven, production-ready enterprise application for print floor monitoring, production jobs, RIP-to-print workflow tracking, machine integration, inventory management, automatic costing, and end-of-shift reporting.

---

## 1. System Modules & Capabilities

1. **Overview Dashboard**: Centralized real-time floor metrics, active jobs, pieces produced today, material wastage percentage, overrun alerts, 7-day and 30-day interactive production charts, live queue, and quick actions.
2. **Production Jobs**: Complete production job lifecycle management. Unique job numbers, customer and dealer tracking, dimensions, priority, and **mandatory artwork image validation**. Marked urgent jobs feature **full red row highlighting** (`urgent-row`) with readable typography. Real-time counter simulation, search, and multi-parameter filters.
3. **Machine Monitor**: Comprehensive monitoring for all **seven approved presses** (Colorjet SoniQ, Colorjet Verve, NegiSign, Caldron Eco Solvent, HP Latex 730, Audley 10ft, HP Latex 1500). Clean tabular telemetry matrix showing press status, software mappings, today's output, utilization bars, and connection exceptions.
4. **Print Event Monitor**: Audit trail of detected print software events with SHA-256 idempotency fingerprinting to prevent duplicate counts from double-incrementing production output. Pilot checklist and Colorjet SoniQ Solvent pilot candidate analysis.
5. **RIP to Print Workflow**: Interactive 6-step / 10-stage workflow mapping the client's actual production process: network share `\\MACHINEROOM\2026\October\29\` -> local staging `G:\` -> MainTop RIP processing -> PRN output generation -> PrintExp job command -> Output reconciliation.
6. **PrintExp Jobs & History**: Mapped from client's latest PrintExp walkthrough. **Read-only monitoring view** of automatically detected settings: PRN file, resolution DPI, print dimensions, X-axis copies, Y-axis copies, and automatically computed **Planned Copies = X-axis Copies × Y-axis Copies**. Completed and cancelled history list with CSV export.
7. **Artwork Library**: Visual gallery of server-staged artworks with thumbnails, format badges (TIFF/SVG), customer/dealer tags, and "Create job from artwork" shortcuts.
8. **Ink and Material Stock**: Clean tabular inventory layout supporting ink types (CMYK, White, Violet) and roll media (Roll widths: **3 ft, 4 ft, 5 ft, 6 ft, 8 ft, 10 ft**). Primary table with available stock, unit cost, reorder level, stock value, and status pills. Movement ledger tracking purchases, usage, opening stock, and adjustments.
9. **Costing & Wastage**: Cost configuration section for ink rates, print head lifespan and depreciation basis (e.g. Epson DX5 per 500,000 sq ft), and roll materials. Automatic job-wise costing calculations preserving historical purchase rates:
   - $\text{Total Job Cost} = \text{Material Cost} + \text{Ink Cost} + \text{Ink Head Usage Cost}$
   - $\text{Wastage Amount} = \text{Wasted Material Cost} + \text{Wasted Ink Cost} + \text{Applicable Head Cost}$
   - $\text{Cost Per Good Piece} = \frac{\text{Total Job Cost}}{\text{Verified Good Pieces}}$
10. **Reports & Exports**: Report builder with date range filtering (From/To), machine filter, and report types (Production summary, Costing & wastage, Inventory movements). One-click export to CSV and Excel (XLS).
11. **Alerts & Activity**: Overrun detection alarms, machine connection timeout monitors, low-stock warnings, and live audit event log.
12. **Settings**: Configurable overrun threshold rules, dashboard refresh intervals, shift cut-off time, and local connector IP host.

---

## 2. Technology Stack

- **Frontend**: Next.js 16 / React / TypeScript / Tailwind CSS / Socket.IO Client
- **Backend**: Node.js / NestJS / REST APIs / Socket.IO Gateway / Swagger OpenAPI (`/api/docs`)
- **Database**: PostgreSQL 16 / Prisma ORM (22 normalized tables, migrations & seed scripts)
- **Local Connector**: Windows-based Node.js service with modular adapter architecture (`connector/`)
- **Authentication**: JWT with secure `HttpOnly` session cookies and Role-Based Access Control (`ADMIN`, `OPERATOR`)
- **Deployment**: Multi-container Docker & `docker-compose.yml`

---

## 3. Directory Layout

```
d:/DRP PRINTING MONITORING SYSTEM/
├── backend/                  # NestJS backend application
│   ├── prisma/
│   │   ├── schema.prisma     # 22 PostgreSQL models & relations
│   │   └── seed.ts           # Master seed script (7 machines, users, materials)
│   ├── src/
│   │   ├── auth/             # JWT & HttpOnly cookie auth
│   │   ├── machines/         # 7 Machines master & telemetry
│   │   ├── jobs/             # Job management & mandatory artwork validation
│   │   ├── artwork/          # Artwork file uploads & previews
│   │   ├── printexp/         # PrintExp read-only auto-read & history
│   │   ├── workflow/         # 10-step RIP-to-Print workflow
│   │   ├── events/           # Print events & duplicate blocking
│   │   ├── connector/        # Windows connector heartbeat & batch ingestion
│   │   ├── inventory/        # Tabular inventory (3ft to 10ft rolls)
│   │   ├── costing/          # Cost configuration & wastage engine
│   │   ├── reports/          # Shift reports & CSV/Excel export
│   │   ├── notifications/    # Overrun & offline alerts
│   │   ├── gateway/          # Real-time Socket.IO gateway
│   │   ├── dashboard/        # Consolidated floor KPIs
│   │   ├── settings/         # Portal operational rules
│   │   ├── app.module.ts
│   │   └── main.ts           # Swagger setup at /api/docs
│   └── package.json
├── frontend/                 # Next.js 16 frontend application
│   ├── src/app/
│   │   ├── globals.css       # Complete approved design system & urgent-row styling
│   │   ├── layout.tsx
│   │   └── page.tsx          # Master interactive console (All 12 modules)
│   ├── src/lib/api.ts        # REST client & CSV exporter
│   ├── tailwind.config.js
│   └── package.json
├── connector/                # Windows-based Local Machine Connector
│   ├── src/
│   │   ├── adapters/         # 9 Software adapters (SAI, Gama, RYPC, PSN9,
│   │   │                     # NegiSign, MainTop, PrintExp, PrintExp_64, ONYX)
│   │   ├── queue.ts          # Offline persistent JSON queue with retry
│   │   ├── types.ts
│   │   └── index.ts          # Connector orchestrator & heartbeat
│   └── package.json
├── docs/                     # Production documentation
│   ├── ARCHITECTURE.md
│   ├── MACHINE_ADAPTERS.md
│   ├── WINDOWS_CONNECTOR_GUIDE.md
│   └── TESTING_AND_VERIFICATION_REPORT.md
├── docker-compose.yml        # PostgreSQL 16, backend, and frontend
├── Dockerfile.backend
├── Dockerfile.frontend
└── package.json              # Root project orchestrator
```

---

## 4. Local Development & Quick Start

### 4.1 Running with Docker Compose (Recommended for Production)
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend REST API: `http://localhost:4000`
- Swagger OpenAPI Documentation: `http://localhost:4000/api/docs`
- PostgreSQL: `localhost:5432` (db: `drp_db`, user: `drp_user`)

### 4.2 Running Locally without Docker
1. **Backend**:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npm run start:dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Local Machine Connector (Floor Windows PC)**:
   ```bash
   cd connector
   npm install
   npm run dev
   ```

---

## 5. Default User Accounts

- **Administrator**:
  - Email: `admin@drp.com`
  - Password: `admin123`
- **Operator**:
  - Email: `operator@drp.com`
  - Password: `op123`
