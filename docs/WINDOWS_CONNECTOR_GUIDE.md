# DRP Printing Monitoring System — Windows Machine Connector Guide

This guide describes how to install, configure, and operate the **DRP Local Machine Connector** on Windows PC hosts operating RIP and printing software.

---

## 1. Connector Responsibilities

The Windows Machine Connector runs locally on the print floor PC to:
- Discovers local software queues and active spool files.
- Automatically captures print settings (DPI, dimensions, X/Y copies, planned copies) without operator re-entry.
- Sends heartbeats to the central DRP portal every 5 seconds.
- Batches print start, progress, completion, and cancellation events.
- Queues events locally in a persistent JSON file (`connector_queue.json`) when network is interrupted, and automatically retries upon reconnect.

---

## 2. Prerequisites

1. **Operating System**: Windows 10 / 11 / Windows Server 2019+ (64-bit).
2. **Node.js**: v18.x or v20+ installed.
3. **Network Access**:
   - Access to central DRP Portal backend at `http://<PORTAL_IP>:4000`.
   - Access to network artwork share `\\MACHINEROOM\2026\October\29\`.
   - Local staging directory mounted at `G:\`.

---

## 3. Installation Steps

### Step 1: Deploy Files
Copy the `connector/` folder to the target Windows machine (for example: `C:\DRP-Connector\`).

### Step 2: Configure Environment (`.env`)
Create or edit `C:\DRP-Connector\.env`:
```env
BACKEND_URL=http://192.168.1.10:4000
CONNECTOR_API_KEY=drp-connector-api-key-safe-2026

# Folder Paths
NETWORK_FOLDER=\\MACHINEROOM\2026\October\29\
STAGING_FOLDER=G:\2026\October\29\
PRINTEXP_DIR=C:\PrintExp
MAINTOP_DIR=C:\MainTop

# Set to false in live production
SIMULATED=false
```

### Step 3: Install Dependencies & Build
```powershell
cd C:\DRP-Connector
npm install
npm run build
```

### Step 4: Run as a Windows Background Service
To ensure the connector starts automatically when Windows boots and recovers from crashes:
1. Download **NSSM** (Non-Sucking Service Manager) from [nssm.cc](https://nssm.cc/).
2. Run in an Administrator PowerShell terminal:
```powershell
nssm install DRPConnector "C:\Program Files\nodejs\node.exe" "C:\DRP-Connector\dist\index.js"
nssm set DRPConnector AppDirectory "C:\DRP-Connector"
nssm set DRPConnector Description "DRP Printing Monitoring Local Machine Connector"
nssm set DRPConnector Start SERVICE_AUTO_START
nssm start DRPConnector
```

---

## 4. Offline Resiliency & Retries

If the central portal or floor Wi-Fi/LAN experiences a disconnect:
1. The connector caches all generated events in `C:\DRP-Connector\connector_queue.json`.
2. Heartbeats retry silently every 5 seconds.
3. Once connectivity is restored, all queued events are posted in batches of 25.
4. The server validates each event against its SHA-256 fingerprint; duplicate events are blocked from corrupting production quantities.
