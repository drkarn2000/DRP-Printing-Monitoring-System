// DRP Machine Connector - Types and Interfaces

export type SoftwareType =
  | 'SAI_PHOTOPRINT'
  | 'GAMA_PRINT'
  | 'RYPC_PRINT'
  | 'PSN9_SELECT'
  | 'NEGISIGN'
  | 'MAINTOP'
  | 'PRINTEXP'
  | 'PRINTEXP_64'
  | 'ONYX';

export interface ConnectorConfig {
  backendUrl: string;
  apiKey: string;
  deviceId: string;
  deviceName: string;
  heartbeatIntervalMs: number;
  syncIntervalMs: number;
  networkFolder: string; // e.g. \\MACHINEROOM\2026\October\29\
  stagingFolder: string; // e.g. G:\2026\October\29\
  printexpDir: string;
  maintopDir: string;
  isSimulatedFallback: boolean;
}

export interface DetectedJob {
  filename: string;
  jobName: string;
  machineId: string;
  dpi: string;
  dimensions: string;
  xCopies: number;
  yCopies: number;
  plannedCopies: number;
  progressPct: number;
  status: 'Loaded' | 'Printing' | 'Finished' | 'Cancelled';
  startTime?: string;
  finishTime?: string;
  rawRecord?: string;
}

export interface PrintEventPayload {
  eventKey: string; // SHA-256 fingerprint of machine + filename + eventType + timestamp/offset
  machineId: string;
  software: SoftwareType;
  eventType: 'JOB_LOADED' | 'PRINT_START' | 'PROGRESS_UPDATE' | 'PRINT_FINISH' | 'PRINT_CANCEL' | 'COUNTER_INCREMENT' | 'PRN_GENERATED';
  filename: string;
  jobId?: string;
  qtySignal: string;
  verified: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface MachineTelemetry {
  machineId: string;
  status: 'LIVE' | 'IDLE' | 'ERROR' | 'OFFLINE';
  activeJob?: string;
  lastHeartbeat: string;
  outputToday: number;
  utilizationPct: number;
  errorDetails?: string;
}

export interface IMachineAdapter {
  readonly softwareType: SoftwareType;
  readonly machineId: string;
  readonly supportedSoftware: string;
  init(): Promise<void>;
  pollJobs(): Promise<DetectedJob[]>;
  collectEvents(): Promise<PrintEventPayload[]>;
  getTelemetry(): Promise<MachineTelemetry>;
  dispose(): Promise<void>;
}
