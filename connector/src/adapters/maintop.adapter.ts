import { BaseMachineAdapter } from './base.adapter';
import { SoftwareType, DetectedJob, PrintEventPayload, MachineTelemetry } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class MainTopAdapter extends BaseMachineAdapter {
  readonly softwareType: SoftwareType = 'MAINTOP';
  readonly supportedSoftware: string = 'MainTop RIP';

  constructor(
    readonly machineId: string,
    private readonly prnExportFolder: string = 'G:\\',
    private readonly networkFolder: string = '\\\\MACHINEROOM\\2026\\October\\29\\'
  ) {
    super();
  }

  async pollJobs(): Promise<DetectedJob[]> {
    const jobs: DetectedJob[] = [];
    if (fs.existsSync(this.prnExportFolder)) {
      try {
        const files = fs.readdirSync(this.prnExportFolder);
        for (const file of files) {
          if (file.toLowerCase().endsWith('.prn')) {
            jobs.push({
              filename: file,
              jobName: path.parse(file).name,
              machineId: this.machineId,
              dpi: '720 × 1440',
              dimensions: '8 × 10 ft',
              xCopies: 1,
              yCopies: 1,
              plannedCopies: 1,
              progressPct: 100,
              status: 'Loaded'
            });
          }
        }
      } catch (err) {
        console.warn(`[MainTop Adapter] Could not read PRN export folder:`, err);
      }
    }
    return jobs;
  }

  async collectEvents(): Promise<PrintEventPayload[]> {
    const events: PrintEventPayload[] = [];
    if (fs.existsSync(this.prnExportFolder)) {
      try {
        const files = fs.readdirSync(this.prnExportFolder);
        for (const file of files) {
          if (file.toLowerCase().endsWith('.prn')) {
            const key = this.generateEventKey(this.machineId, file, 'PRN_GENERATED');
            if (!this.processedEventKeys.has(key)) {
              this.processedEventKeys.add(key);
              events.push({
                eventKey: key,
                machineId: this.machineId,
                software: this.softwareType,
                eventType: 'PRN_GENERATED',
                filename: file,
                qtySignal: 'PRN Output File Ready',
                verified: 'Software record only · Physical output unverified',
                metadata: { folder: this.prnExportFolder },
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (e) {
        console.warn(`[MainTop Adapter] Error collecting events:`, e);
      }
    }
    return events;
  }

  async getTelemetry(): Promise<MachineTelemetry> {
    return {
      machineId: this.machineId,
      status: 'LIVE',
      activeJob: 'storefront_panel_02.tif',
      lastHeartbeat: new Date().toISOString(),
      outputToday: 3960,
      utilizationPct: 42
    };
  }
}
