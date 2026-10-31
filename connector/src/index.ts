import { SaiPhotoPrintAdapter } from './adapters/saiphotoprint.adapter';
import { GamaPrintAdapter } from './adapters/gamaprint.adapter';
import { RypcPrintAdapter } from './adapters/rypcprint.adapter';
import { Psn9SelectAdapter } from './adapters/psn9select.adapter';
import { NegiSignAdapter } from './adapters/negisign.adapter';
import { MainTopAdapter } from './adapters/maintop.adapter';
import { PrintExpAdapter } from './adapters/printexp.adapter';
import { PrintExp64Adapter } from './adapters/printexp64.adapter';
import { OnyxAdapter } from './adapters/onyx.adapter';
import { LocalEventQueue } from './queue';
import { ConnectorConfig, IMachineAdapter } from './types';
import * as dotenv from 'dotenv';
import * as os from 'os';

dotenv.config();

const config: ConnectorConfig = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
  apiKey: process.env.CONNECTOR_API_KEY || 'drp-connector-api-key-safe-2026',
  deviceId: `WIN-${os.hostname()}`,
  deviceName: `DRP-Floor-Connector-${os.hostname()}`,
  heartbeatIntervalMs: 5000,
  syncIntervalMs: 3000,
  networkFolder: process.env.NETWORK_FOLDER || '\\\\MACHINEROOM\\2026\\October\\29\\',
  stagingFolder: process.env.STAGING_FOLDER || 'G:\\2026\\October\\29\\',
  printexpDir: process.env.PRINTEXP_DIR || 'C:\\PrintExp',
  maintopDir: process.env.MAINTOP_DIR || 'C:\\MainTop',
  isSimulatedFallback: process.env.SIMULATED !== 'false'
};

class MachineConnectorService {
  private adapters: IMachineAdapter[] = [];
  private queue = new LocalEventQueue();
  private isRunning = false;

  async start(): Promise<void> {
    console.log(`=======================================================`);
    console.log(`  DRP Printing Monitoring System - Local Machine Connector`);
    console.log(`  Device: ${config.deviceName} (${config.deviceId})`);
    console.log(`  Target Backend: ${config.backendUrl}`);
    console.log(`=======================================================`);

    // Register all 7 machines with their respective adapters
    // 1. Colorjet SoniQ Solvent (M01): SAI PhotoPRINT / SAI PhotoPRINT
    this.adapters.push(new SaiPhotoPrintAdapter('M01'));
    // 2. Colorjet Verve UV (M02): Gama Print / RYPC Print
    this.adapters.push(new GamaPrintAdapter('M02'));
    this.adapters.push(new RypcPrintAdapter('M02'));
    // 3. NegiSign UV (M03): PSN9 Select / NegiSign
    this.adapters.push(new Psn9SelectAdapter('M03'));
    this.adapters.push(new NegiSignAdapter('M03'));
    // 4. Caldron Eco Solvent (M04): Maintop / PrintExp
    this.adapters.push(new MainTopAdapter('M04'));
    this.adapters.push(new PrintExpAdapter('M04'));
    // 5. HP Latex 730 (M05): SAI PhotoPRINT / SAI PhotoPRINT
    this.adapters.push(new SaiPhotoPrintAdapter('M05'));
    // 6. Audley 10ft Roll-to-Roll UV (M06): MainTop / PrintExp_64
    this.adapters.push(new MainTopAdapter('M06'));
    this.adapters.push(new PrintExp64Adapter('M06'));
    // 7. HP Latex 1500 (M07): ONYX / ONYX
    this.adapters.push(new OnyxAdapter('M07'));

    for (const adapter of this.adapters) {
      await adapter.init();
    }

    this.isRunning = true;
    this.startHeartbeatLoop();
    this.startEventCollectionLoop();
  }

  private startHeartbeatLoop(): void {
    setInterval(async () => {
      if (!this.isRunning) return;
      try {
        const telemetries = await Promise.all(this.adapters.map(a => a.getTelemetry()));
        // Send heartbeat to backend API
        const payload = {
          deviceId: config.deviceId,
          deviceName: config.deviceName,
          hostname: os.hostname(),
          ipAddress: '127.0.0.1',
          timestamp: new Date().toISOString(),
          machines: telemetries
        };

        const res = await fetch(`${config.backendUrl}/api/connector/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-connector-key': config.apiKey
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          // Heartbeat succeeded
        }
      } catch (err: any) {
        // Backend might be offline; will retry seamlessly
      }
    }, config.heartbeatIntervalMs);
  }

  private startEventCollectionLoop(): void {
    setInterval(async () => {
      if (!this.isRunning) return;

      // 1. Collect events from all adapters
      for (const adapter of this.adapters) {
        try {
          const events = await adapter.collectEvents();
          for (const ev of events) {
            this.queue.enqueue(ev);
          }
        } catch (err) {
          console.warn(`[Connector] Error collecting from ${adapter.supportedSoftware}:`, err);
        }
      }

      // 2. Flush pending queue to backend with retry
      const batch = this.queue.dequeueBatch(25);
      if (batch.length > 0) {
        try {
          const res = await fetch(`${config.backendUrl}/api/connector/events/batch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-connector-key': config.apiKey
            },
            body: JSON.stringify({ events: batch })
          });

          if (res.ok) {
            const data: any = await res.json();
            const ackKeys = data.acknowledgedKeys || batch.map(b => b.eventKey);
            this.queue.acknowledgeBatch(ackKeys);
          }
        } catch (err) {
          // Offline, retry on next cycle
        }
      }
    }, config.syncIntervalMs);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    for (const a of this.adapters) {
      await a.dispose();
    }
    console.log(`[Connector] Stopped gracefully.`);
  }
}

const service = new MachineConnectorService();
service.start().catch(console.error);

process.on('SIGINT', async () => {
  await service.stop();
  process.exit(0);
});
