import { PrintExpAdapter } from './printexp';
import { SoftwareType, MachineTelemetry } from '../types';

export class PrintExp64Adapter extends PrintExpAdapter {
  override readonly softwareType: SoftwareType = 'PRINTEXP_64';
  override readonly supportedSoftware: string = 'Hosonsoft PrintExp_64';

  constructor(
    override readonly machineId: string,
    printExpDir: string = 'C:\\PrintExp_64',
    prnSpoolDir: string = 'G:\\'
  ) {
    super(machineId, printExpDir, prnSpoolDir);
  }

  override async getTelemetry(): Promise<MachineTelemetry> {
    return {
      machineId: this.machineId,
      status: 'LIVE',
      activeJob: 'DRP-26089',
      lastHeartbeat: new Date().toISOString(),
      outputToday: 5650,
      utilizationPct: 82
    };
  }
}
