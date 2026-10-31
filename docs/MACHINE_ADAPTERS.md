# DRP Printing Monitoring System — Machine Adapters Specification

This document details the modular adapter architecture implemented in `connector/src/adapters/` for the seven printing machines and nine RIP / printing controller software suites.

---

## 1. Adapter Registry Overview

| Software Suite | Supported Machines | Adapter Class | Detection Mechanism | Verification Status |
|---|---|---|---|---|
| **SAi PhotoPRINT / Production Manager** | M01 (Colorjet SoniQ), M05 (HP Latex 730) | `SaiPhotoPrintAdapter` | Job queue XML / `JobLog.csv` parser | Pilot Ready (History verified) |
| **Gama Print** | M02 (Colorjet Verve UV) | `GamaPrintAdapter` | Spool directory `.job` files & status DB | To Verify with vendor |
| **RYPC Print** | M02 (Colorjet Verve UV) | `RypcPrintAdapter` | Controller spool status & history log | To Verify with vendor |
| **PSN9 Select** | M03 (NegiSign UV) | `Psn9SelectAdapter` | Hot folder queue & XML ticket parser | To Verify with vendor |
| **NegiSign Printing Software** | M03 (NegiSign UV) | `NegiSignAdapter` | NegiSign queue log / counter status | To Verify with vendor |
| **MainTop RIP** | M04 (Caldron), M06 (Audley 10ft) | `MainTopAdapter` | Hot folder PRN file header extraction (`G:\`) | Workflow Verified |
| **Hosonsoft PrintExp** | M04 (Caldron Eco Solvent) | `PrintExpAdapter` | Runtime `JobList.ini` & `PrintHistory.log` | Walkthrough Verified |
| **Hosonsoft PrintExp_64** | M06 (Audley 10ft Roll to Roll UV) | `PrintExp64Adapter` | 64-bit runtime `JobList.ini` parser | Walkthrough Verified |
| **ONYX RIP-Queue** | M07 (HP Latex 1500) | `OnyxAdapter` | ONYX REST API / JDF Queue interface | Offline / Connection Lost |

---

## 2. In-Depth Adapter Implementations

### 2.1 Hosonsoft PrintExp & PrintExp_64 Adapters
- **Source Files**: [`printexp.adapter.ts`](file:///d:/DRP%20PRINTING%20MONITORING%20SYSTEM/connector/src/adapters/printexp.adapter.ts), [`printexp64.adapter.ts`](file:///d:/DRP%20PRINTING%20MONITORING%20SYSTEM/connector/src/adapters/printexp64.adapter.ts)
- **Client Feedback Compliance**:
  - The portal provides a **read-only monitoring view** of automatically detected settings.
  - Manual inputs for X/Y copies or loading PRNs from portal have been eliminated.
  - Automatically reads:
    - PRN Filename: `dealer_banner_oct.prn`
    - DPI: `720 × 1800`
    - Dimensions: `10 × 4 ft`
    - X-Axis Copies: `2`
    - Y-Axis Copies: `2`
    - Planned Total Copies: `4` ($2 \times 2 = 4$)
    - Progress: `76%`
    - Status: `Printing`
- **History Detection**:
  - Monitors `PrintHistory.log` to ingest `Print Finish` and `Cancelled by operator` records without manual operator intervention.

### 2.2 SAi PhotoPRINT / Production Manager Adapter
- **Source File**: [`saiphotoprint.adapter.ts`](file:///d:/DRP%20PRINTING%20MONITORING%20SYSTEM/connector/src/adapters/saiphotoprint.adapter.ts)
- **Role**: Primary candidate for non-HP machine pilot on Colorjet SoniQ Solvent (M01).
- **Integration**:
  - Production Manager creates structured job logs in `C:\Program Files\SAi\Production Manager\Log\JobLog.csv`.
  - Ingests completion timestamps, filename, media type, and copy counts.
  - Generates SHA-256 idempotency fingerprint from `timestamp + filename + status` to prevent duplicate counter increments.

### 2.3 MainTop RIP Adapter
- **Source File**: [`maintop.adapter.ts`](file:///d:/DRP%20PRINTING%20MONITORING%20SYSTEM/connector/src/adapters/maintop.adapter.ts)
- **Role**: Tracks RIP processing and PRN output file generation.
- **Integration**:
  - File watcher on local staging drive `G:\` detects `.prn` files as soon as MainTop finishes rendering.
  - Captures PRN generation events and triggers status update in the portal workflow stage 4.

---

## 3. Idempotency & Duplicate Event Prevention

To guarantee that network retries or repeated software log rows never increment production counters twice:
```typescript
protected generateEventKey(machineId: string, filename: string, eventType: string, qualifier: string = ''): string {
  const raw = `${machineId}:${filename.toLowerCase()}:${eventType}:${qualifier}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}
```
If an event arrives with an existing `eventKey`, the backend logs it as `Duplicate blocked` and returns an acknowledgment to the connector without incrementing the machine's or job's produced quantity.
