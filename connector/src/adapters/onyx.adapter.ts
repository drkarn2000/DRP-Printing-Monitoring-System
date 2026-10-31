import { BaseMachineAdapter } from './base.adapter';
import { SoftwareType, DetectedJob, PrintEventPayload, MachineTelemetry } from '../types';

export class OnyxAdapter extends BaseMachineAdapter {
  readonly softwareType: SoftwareType = 'ONYX';
  readonly supportedSoftware: string = 'ONYX RIP-Queue & Production';

  constructor(
    readonly machineId: string,
    private readonly onyxApiUrl: string = 'http://localhost:8080/onyx/api'
  ) {
    super();
  }

  async pollJobs(): Promise<DetectedJob[]> {
    // ONYX exposes REST API or XML Hot Folder tickets
    return [];
  }

  async collectEvents(): Promise<PrintEventPayload[]> {
    return [];
  }

  async getTelemetry(): Promise<MachineTelemetry> {
    // Note: HP Latex 1500 (M07) is currently offline / connection lost exception
    return {
      machineId: this.machineId,
      status: 'ERROR',
      lastHeartbeat: new Date(Date.now() - 120000).toISOString(),
      outputToday: 0,
      utilizationPct: 0,
      errorDetails: 'Connection lost · Heartbeat timeout (2 min)'
    };
  }
}
