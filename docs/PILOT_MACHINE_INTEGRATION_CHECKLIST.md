# DRP Printing Monitoring System — Physical Machine Pilot Integration Checklist

**Target Machine**: Colorjet SoniQ Solvent (Machine ID: `M01`)  
**RIP / Controller Software**: SAi PhotoPRINT / Production Manager (Cloud Edition or Windows v12/19/21)  
**Alternative Pilot Candidate**: Caldron Eco Solvent (`M04`) with MainTop RIP + Hosonsoft PrintExp  

---

## 1. Pre-Integration Readiness (IT & Print Floor Supervisor)

- [ ] **Print Floor PC Accessibility**:
  - The PC controlling Machine M01 has Windows 10/11 64-bit.
  - Node.js (v18.x or v20+) installed on the floor PC (`node -v`).
  - Network reachability to central DRP portal backend (`ping <PORTAL_SERVER_IP>` or `curl http://<PORTAL_SERVER_IP>:4000/api/machines`).
  - Outbound TCP port `4000` is allowed in Windows Defender Firewall.

- [ ] **Software Paths Verification (SAi PhotoPRINT / Production Manager)**:
  - Verify SAi JobLog folder exists: `C:\Program Files\SAi\Production Manager\Log\`
  - Confirm `JobLog.csv` exists and is populated when jobs finish.
  - Check active queue folder: `C:\Program Files\SAi\Production Manager\Jobs\`
  - If installed in custom location (e.g., `D:\SAi\`), record the exact path and configure `SAI_PRODUCTION_MANAGER_DIR` in `.env`.

- [ ] **Network Shared Storage Readiness**:
  - Central artwork share mapped or accessible: `\\MACHINEROOM\2026\October\29\`
  - Local staging directory exists on floor PC: `G:\2026\October\29\` (or equivalent local drive).

---

## 2. Connector Deployment on Floor PC

- [ ] Copy the `connector` folder onto the floor PC (e.g. `C:\DRP-Connector\`).
- [ ] Create `C:\DRP-Connector\.env` matching floor settings:
  ```env
  BACKEND_URL=http://<PORTAL_SERVER_IP>:4000
  CONNECTOR_API_KEY=drp-connector-api-key-safe-2026
  SIMULATED=false
  ```
- [ ] Run `start-connector.bat` to launch the connector in foreground interactive mode for the initial test.
- [ ] Check terminal output for:
  - `DRP-Floor-Connector-<HOSTNAME> registered`
  - `Heartbeat acknowledged by Central Portal`
  - `SAi PhotoPRINT adapter monitoring JobLog.csv`

---

## 3. Real Print Event Capture & Verification Procedure

> **CRITICAL RULE**: Do not mark the machine as physically integrated until real software output is captured in this test.

1. **Baseline Check**:
   - In the DRP Portal UI, navigate to **Machine Monitor** (`M01`).
   - Check status badge. Prior to pilot test, badge must read `[Pre-Pilot Baseline · Unverified]`.

2. **Trigger Pilot Print in SAi PhotoPRINT**:
   - The operator loads a known test job (e.g., `dealer_banner_oct.tif`) into SAi Production Manager.
   - Configure copy count: e.g. X = 1, Y = 2 (Total Planned = 2 copies).
   - Send job to Colorjet SoniQ Solvent printer.

3. **Verify Automatic Telemetry Ingestion**:
   - Open `C:\Program Files\SAi\Production Manager\Log\JobLog.csv`.
   - Verify a new completed line is appended.
   - Within 5 seconds, check DRP Portal **Print Event Monitor**:
     - Event Type: `PRINT_FINISH`
     - File: `dealer_banner_oct.tif`
     - Qty Signal: `Copies: 2`
     - Verification badge: `[Software record confirmed · SHA-256 fingerprint verified]`
   - Verify that re-sending the same log file does NOT duplicate quantities (Idempotency status: `Duplicate blocked`).

4. **Physical Counter Reconciliation**:
   - Floor supervisor counts physical banner pieces exited from Colorjet SoniQ printer.
   - Confirm physically verified count matches software report (e.g. 2 pieces).
   - Mark job stage as `Production count reconciled`.

---

## 4. Post-Pilot Production Service Setup

- [ ] Once real software event capture is verified in foreground mode, terminate `start-connector.bat`.
- [ ] Right-click `install-service.bat` and select **Run as Administrator**.
- [ ] Verify in Windows Services (`services.msc`) that `DRPConnector` is Running and Startup type is `Automatic`.
- [ ] Restart the print floor PC to confirm automatic recovery upon system boot.
