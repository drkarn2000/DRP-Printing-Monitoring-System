import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MachineRecord {
  id: string;
  name: string;
  model: string;
  software: string;
  vendor: string;
  pilot: boolean;
  status: 'live' | 'idle' | 'error' | 'offline';
  output: number;
  util: number;
  job: string;
  last: string;
  integration: string;
}

@Injectable()
export class MachinesService {
  // Master records for all seven approved machines as defined in Machines.pptx
  private machines: MachineRecord[] = [
    {
      id: 'M01',
      name: 'Colorjet SoniQ Solvent',
      model: 'RIP: SAi PhotoPRINT · Print: SAi PhotoPRINT',
      software: 'SAi PhotoPRINT / Production Manager',
      vendor: 'Colorjet',
      pilot: true,
      status: 'live',
      output: 8420,
      util: 78,
      job: 'DRP-26084',
      last: 'Live · 3 sec ago',
      integration: 'History/API access verified in pilot',
    },
    {
      id: 'M02',
      name: 'Colorjet Verve UV',
      model: 'RIP: Gama Print · Print: RYPC Print',
      software: 'Gama Print / RYPC Print',
      vendor: 'Colorjet',
      pilot: false,
      status: 'live',
      output: 6250,
      util: 64,
      job: 'DRP-26087',
      last: 'Live · 2 sec ago',
      integration: 'Vendor interface to verify',
    },
    {
      id: 'M03',
      name: 'NegiSign UV',
      model: 'RIP: PSN9 Select · Print: NegiSign',
      software: 'PSN9 Select / NegiSign',
      vendor: 'NegiSign',
      pilot: false,
      status: 'live',
      output: 4180,
      util: 51,
      job: 'DRP-26091',
      last: 'Live · 4 sec ago',
      integration: 'Vendor interface to verify',
    },
    {
      id: 'M04',
      name: 'Caldron Eco Solvent',
      model: 'RIP: Maintop · Print: PrintExp',
      software: 'Maintop / PrintExp',
      vendor: 'Caldron',
      pilot: false,
      status: 'live',
      output: 3960,
      util: 42,
      job: 'DRP-26082',
      last: 'Live · 5 sec ago',
      integration: 'Logs/export/API to verify',
    },
    {
      id: 'M05',
      name: 'HP Latex 730',
      model: 'RIP: SAi PhotoPRINT · Print: SAi PhotoPRINT',
      software: 'SAi PhotoPRINT / Production Manager',
      vendor: 'HP',
      pilot: false,
      status: 'idle',
      output: 0,
      util: 0,
      job: 'No active job',
      last: 'Idle',
      integration: 'Pilot excluded',
    },
    {
      id: 'M06',
      name: 'Audley 10ft Roll to Roll UV',
      model: 'RIP: MainTop · Print: PrintExp_64',
      software: 'MainTop / PrintExp_64',
      vendor: 'Audley',
      pilot: false,
      status: 'live',
      output: 5650,
      util: 82,
      job: 'DRP-26089',
      last: 'Live · 2 sec ago',
      integration: 'Logs/export/API to verify',
    },
    {
      id: 'M07',
      name: 'HP Latex 1500',
      model: 'RIP: ONYX · Print: ONYX',
      software: 'ONYX',
      vendor: 'HP',
      pilot: false,
      status: 'error',
      output: 0,
      util: 0,
      job: 'Connection lost',
      last: 'Offline · 2 min ago',
      integration: 'Pilot excluded',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<MachineRecord[]> {
    if (this.prisma.isConnectedToDb) {
      try {
        const dbMachines = await this.prisma.machine.findMany({ orderBy: { id: 'asc' } });
        if (dbMachines && dbMachines.length > 0) {
          return dbMachines.map((m) => ({
            id: m.id,
            name: m.name,
            model: m.model,
            software: m.software,
            vendor: m.vendor,
            pilot: m.pilot,
            status: m.status.toLowerCase() as any,
            output: m.outputToday,
            util: m.utilizationPct,
            job: m.currentJobId || (m.status === 'LIVE' ? 'Active' : 'No active job'),
            last: m.lastHeartbeatAt ? 'Live · ' + new Date(m.lastHeartbeatAt).toLocaleTimeString() : (m.status === 'LIVE' ? 'Demo · Live' : 'Demo · Idle'),
            integration: m.integrationNotes || 'Database record verified',
          }));
        }
      } catch (err) {
        // Graceful fallback to memory state
      }
    }
    return this.machines;
  }

  async getById(id: string): Promise<MachineRecord> {
    if (this.prisma.isConnectedToDb) {
      try {
        const m = await this.prisma.machine.findUnique({ where: { id } });
        if (m) {
          return {
            id: m.id,
            name: m.name,
            model: m.model,
            software: m.software,
            vendor: m.vendor,
            pilot: m.pilot,
            status: m.status.toLowerCase() as any,
            output: m.outputToday,
            util: m.utilizationPct,
            job: m.currentJobId || 'No active job',
            last: 'Just now',
            integration: m.integrationNotes || '',
          };
        }
      } catch (err) {}
    }
    const machine = this.machines.find((m) => m.id === id);
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }
    return machine;
  }

  async updateHeartbeat(id: string, status: 'live' | 'idle' | 'error' | 'offline', output?: number): Promise<MachineRecord> {
    const machine = await this.getById(id);
    machine.status = status;
    machine.last = 'Just now';
    if (output !== undefined) {
      machine.output = output;
    }

    if (this.prisma.isConnectedToDb) {
      try {
        await this.prisma.machine.update({
          where: { id },
          data: {
            status: status.toUpperCase() as any,
            lastHeartbeatAt: new Date(),
            ...(output !== undefined ? { outputToday: output } : {}),
          },
        });
      } catch (err) {}
    }

    return machine;
  }


  async addOutput(id: string, amount: number, jobId?: string): Promise<MachineRecord> {
    const machine = await this.getById(id);
    machine.output += amount;
    machine.util = Math.min(100, machine.util + 1);
    machine.status = 'live';
    machine.last = 'Just now';
    if (jobId) {
      machine.job = jobId;
    }
    return machine;
  }

  async toggleStatus(id: string): Promise<MachineRecord> {
    const machine = await this.getById(id);
    machine.status = machine.status === 'live' ? 'idle' : 'live';
    machine.last = 'Just now';
    return machine;
  }
}
