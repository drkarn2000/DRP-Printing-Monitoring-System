import { BaseMachineAdapter } from './base.adapter';
import { SoftwareType, DetectedJob, PrintEventPayload, MachineTelemetry } from '../types';

export class GamaPrintAdapter extends BaseMachineAdapter {
  readonly softwareType: SoftwareType = 'GAMA_PRINT';
  readonly supportedSoftware: string = 'Gama Print RIP';

  constructor(readonly machineId: string) {
    super();
  }

  async pollJobs(): Promise<DetectedJob[]> {
    return [{
      filename: 'festive_promo_v3.svg',
      jobName: 'festive_promo_v3',
      machineId: this.machineId,
      dpi: '720 × 1200',
      dimensions: '3 × 6 ft',
      xCopies: 1,
      yCopies: 1,
      plannedCopies: 1,
      progressPct: 64,
      status: 'Printing'
    }];
  }

  async collectEvents(): Promise<PrintEventPayload[]> {
    const key = this.generateEventKey(this.machineId, 'festive_promo_v3.svg', 'RIP_PROCESSED');
    if (!this.processedEventKeys.has(key)) {
      this.processedEventKeys.add(key);
      return [{
        eventKey: key,
        machineId: this.machineId,
        software: this.softwareType,
        eventType: 'JOB_LOADED',
        filename: 'festive_promo_v3.svg',
        qtySignal: 'Copies: 1',
        verified: 'Software record only',
        metadata: { rip: 'Gama Print' },
        timestamp: new Date().toISOString()
      }];
    }
    return [];
  }

  async getTelemetry(): Promise<MachineTelemetry> {
    return {
      machineId: this.machineId,
      status: 'LIVE',
      activeJob: 'DRP-26087',
      lastHeartbeat: new Date().toISOString(),
      outputToday: 6250,
      utilizationPct: 64
    };
  }
}
