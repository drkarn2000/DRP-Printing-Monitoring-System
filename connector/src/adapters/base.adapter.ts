import { IMachineAdapter, SoftwareType, DetectedJob, PrintEventPayload, MachineTelemetry } from '../types';
import * as crypto from 'crypto';

export abstract class BaseMachineAdapter implements IMachineAdapter {
  abstract readonly softwareType: SoftwareType;
  abstract readonly machineId: string;
  abstract readonly supportedSoftware: string;

  protected isInitialized: boolean = false;
  protected lastTelemetry: MachineTelemetry | null = null;
  protected processedEventKeys: Set<string> = new Set();

  async init(): Promise<void> {
    this.isInitialized = true;
    console.log(`[Adapter] Initialized ${this.supportedSoftware} for machine ${this.machineId}`);
  }

  abstract pollJobs(): Promise<DetectedJob[]>;
  abstract collectEvents(): Promise<PrintEventPayload[]>;
  abstract getTelemetry(): Promise<MachineTelemetry>;

  async dispose(): Promise<void> {
    this.isInitialized = false;
  }

  /**
   * Generates a deterministic idempotency key for events to prevent duplicate increments.
   */
  protected generateEventKey(machineId: string, filename: string, eventType: string, qualifier: string = ''): string {
    const raw = `${machineId}:${filename.toLowerCase()}:${eventType}:${qualifier}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
  }

  /**
   * Automatically calculate planned copies: X-axis Copies × Y-axis Copies.
   * "The client does not want operators to enter the same printing settings again in the DRP Portal.
   * Calculate planned copies automatically: Planned Copies = X-axis Copies × Y-axis Copies"
   */
  protected calculatePlannedCopies(x: number, y: number): number {
    const validX = Math.max(1, Math.floor(x || 1));
    const validY = Math.max(1, Math.floor(y || 1));
    return validX * validY;
  }
}
