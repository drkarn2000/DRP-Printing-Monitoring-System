# DRP Printing Monitoring System — Production Architecture Specification

## 1. System Overview

The **DRP Printing Monitoring System** is an enterprise-grade, real-time print floor telemetry and production management platform designed for wide-format, solvent, UV, and latex printing environments.

The architecture strictly adheres to the client-approved tech stack and separation of concerns:

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSERS                                   |
|               (Desktop & Tablet Floor Consoles / Management Dashboards)           |
+-----------------------------------------------------------------------------------+
                                          |
                                   HTTP / WebSocket
                                          v
+-----------------------------------------------------------------------------------+
|                        FRONTEND WEB APPLICATION (Next.js 16)                      |
|   - Tailwind CSS + Approved Bespoke Design System Tokenization                    |
|   - Real-time Telemetry Dashboard (7 Machines, Live Queue, Alerts)                |
|   - Production Job Management (Mandatory Artwork Image Preview, Full Red Rows)    |
|   - Tabular Inventory Layout (Ink & Roll Widths: 3ft, 4ft, 5ft, 6ft, 8ft, 10ft)   |
|   - Cost Configuration & Automatic Wastage Computation Engine                     |
|   - Read-Only PrintExp Settings & Job History Telemetry View                      |
+-----------------------------------------------------------------------------------+
                                          |
                                   REST / Socket.IO
                                          v
+-----------------------------------------------------------------------------------+
|                          BACKEND REST API & GATEWAY (NestJS)                      |
|   - Secure JWT Authentication + HttpOnly Session Cookies                          |
|   - Role-Based Access Control (Admin, Operator)                                   |
|   - OpenAPI / Swagger Documentation (/api/docs)                                   |
|   - Socket.IO Real-time Bi-directional Broadcast Gateway                          |
|   - Idempotency & SHA-256 Duplicate Event Blocking Engine                         |
|   - Job Costing & Wastage Reconciliation Calculation Engine                       |
+-----------------------------------------------------------------------------------+
                         |                                          |
                         v                                          v
+------------------------------------+    +-----------------------------------------+
|      PERSISTENCE (PostgreSQL 16)   |    |    WINDOWS LOCAL MACHINE CONNECTOR      |
|   - Prisma ORM 5.x                 |    |    - Node.js Service on Print LAN Host  |
|   - 22 Normalized Entities         |    |    - 9 Modular Software Adapters        |
|   - Foreign Keys & Indexes         |    |    - Network (\\MACHINEROOM) & G:\ Watch|
|   - Historical Cost Auditing       |    |    - Persistent JSON Offline Retry Queue|
+------------------------------------+    +-----------------------------------------+
```

---

## 2. Seven Approved Machines & Software Mappings

The system maintains definitive master records for all 7 presses:

| ID | Press Name | Manufacturer | RIP Software | Printing Controller | Integration Method |
|---|---|---|---|---|---|
| **M01** | Colorjet SoniQ Solvent | Colorjet | SAi PhotoPRINT | SAi PhotoPRINT / Production Manager | Queue XML & JobLog CSV parser |
| **M02** | Colorjet Verve UV | Colorjet | Gama Print | RYPC Print | Spool folder & controller log |
| **M03** | NegiSign UV | NegiSign | PSN9 Select | NegiSign | Hot folder & job ticket |
| **M04** | Caldron Eco Solvent | Caldron | MainTop | PrintExp | MainTop PRN export + PrintExp runtime |
| **M05** | HP Latex 730 | HP | SAi PhotoPRINT | SAi PhotoPRINT | Production Manager interface |
| **M06** | Audley 10ft Roll to Roll UV | Audley | MainTop | PrintExp_64 | 64-bit Hosonsoft controller runtime |
| **M07** | HP Latex 1500 | HP | ONYX | ONYX RIP-Queue | ONYX XML / REST API |

---

## 3. Database Schema Design (Prisma / PostgreSQL)

The database schema is fully normalized across 22 tables:

1. **`users`**: User identities, bcrypt hashed passwords, role assignments, active status.
2. **`roles`**: System roles (`ADMIN`, `OPERATOR`, `SUPERVISOR`).
3. **`permissions`**: Granular system capabilities.
4. **`role_permissions`**: Many-to-many role authorization mappings.
5. **`customers`**: Customer and dealer registry with contact information.
6. **`machines`**: Physical press master records with live telemetry, heartbeats, and today's output counter.
7. **`machine_software`**: Associated software versions, adapters, and configuration parameters.
8. **`connector_devices`**: Registered Windows connector PCs, IP/MAC addresses, and heartbeat timestamps.
9. **`production_jobs`**: Job records with required quantity, produced quantity, priority, and **mandatory artwork image URL**.
10. **`artwork_files`**: Uploaded TIFF/SVG artwork files, dimensions, resolution, format, and storage paths.
11. **`print_jobs`**: PRN file instances, DPI, dimensions, detected X/Y copies, and planned copies ($X \times Y$).
12. **`machine_events`**: Immutable machine event stream with SHA-256 idempotency fingerprint keys.
13. **`print_history`**: History records of completed and cancelled prints.
14. **`ink_products`**: Ink types (CMYK, White, Violet), purchase price, cost per litre, and stock level.
15. **`ink_heads`**: Print heads (e.g., Epson DX5), purchase price, installation date, lifespan in sq ft, and depreciation.
16. **`materials`**: Roll media with explicit roll widths (3ft, 4ft, 5ft, 6ft, 8ft, 10ft), cost per roll, and cost per sq ft.
17. **`suppliers`**: Vendors for inks, print heads, and media.
18. **`purchases`** & **`purchase_items`**: Procurement invoices preserving historical purchase rates.
19. **`inventory_transactions`**: Stock movement ledger (Purchases, Usage, Adjustments, Opening stock).
20. **`job_consumptions`**: Measured/estimated material, ink, and print head consumption per job.
21. **`job_costs`**: Calculated financial totals (Material + Ink + Head usage), wastage cost, and cost per good piece.
22. **`wastage_records`** & **`notifications`** & **`audit_logs`**: System audit trail, overrun alarms, and connection drops.

---

## 4. Production Formulas & Reconciliation Engine

### 4.1 Automatic Planned Copies Calculation
Operators configure print settings exclusively inside their native software (e.g. PrintExp). The system automatically computes:
$$\text{Planned Copies} = \text{X-Axis Copies} \times \text{Y-Axis Copies}$$

### 4.2 Core Job Costing Formula
Changes to current purchase rates never rewrite historical costs:
$$\text{Total Job Cost} = \text{Material Cost} + \text{Ink Cost} + \text{Ink Head Usage Cost}$$

Where:
$$\text{Ink Head Usage Cost} = \text{Printed Area (sq ft)} \times \frac{\text{Head Purchase Price}}{\text{Expected Lifespan (sq ft)}}$$

### 4.3 Wastage Amount Formula
$$\text{Wastage Ratio} = \frac{\text{Wasted Pieces}}{\max(1, \text{Produced Pieces})}$$
$$\text{Wastage Amount} = (\text{Material Cost} + \text{Ink Cost}) \times \text{Wastage Ratio} + \text{Applicable Head Cost}$$

### 4.4 Cost Per Good Piece Formula
$$\text{Cost Per Good Piece} = \frac{\text{Total Job Cost}}{\text{Verified Good Pieces}}$$

---

## 5. Security & RBAC Implementation

- **JWT Session Tokens**: Signed with HMAC-SHA256, issued inside `HttpOnly`, `SameSite=Lax` cookies to prevent XSS exfiltration.
- **Role-Based Guards**: NestJS `@Roles('ADMIN')` and `@Roles('OPERATOR')` decorators enforce server-side route authorization.
- **Connector Authentication**: Custom HTTP Header `x-connector-key` validates machine connector sync requests.
- **Idempotency Fingerprinting**: Prevents duplicate machine events from double-incrementing production quantities.
