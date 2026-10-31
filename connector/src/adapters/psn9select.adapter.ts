import { BaseMachineAdapter } from './base.adapter';
import { SoftwareType, DetectedJob, PrintEventPayload, MachineTelemetry } from '../types';

export class Psn9SelectAdapter extends BaseMachineAdapter {
  readonly softwareType: SoftwareType = 'PSN9_SELECT';
  readonly supportedSoftware: string = 'PSN9 Select RIP';

  constructor(readonly machineId: string) {
    super();
  }

  async pollJobs(): Promise<DetectedJob[]> {
    return [{
      filename: 'winter_sale_front.tif',
      jobName: 'winter_sale_front',
      machineId: this.machineId,
      dpi: '720 × 1440',
      dimensions: '4 × 4 ft',
      xCopies: 1,
      yCopies: 1,
      plannedCopies: 1,
      progressPct: 100,
      status: 'Printing'
    }];
  }

  async collectEvents(): Promise<PrintEventPayload[]> {
    return [];
  }

  async getTelemetry(): Promise<MachineTelemetry> {
    return {
      machineId: this.machineId,
      status: 'LIVE',
      activeJob: 'DRP-26091',
      lastHeartbeat: new Date().toISOString(),
      outputToday: 4180,
      utilizationPct: 51
    };
  }
}
