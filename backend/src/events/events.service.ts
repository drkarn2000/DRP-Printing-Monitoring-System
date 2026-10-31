import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PrintEventItem {
  key: string;
  time: string;
  machine: string;
  file: string;
  job?: string;
  type: string;
  qty: string;
  verification: string;
  state: 'Matched' | 'Unmatched' | 'Duplicate blocked';
}

@Injectable()
export class EventsService {
  private events: PrintEventItem[] = [
    {
      time: '09:42:18',
      machine: 'M01',
      file: 'dealer_banner_oct.tif',
      job: 'DRP-26084',
      type: 'Print queue event',
      qty: 'Copies: 1 · layout unknown',
      verification: 'Physical output unverified',
      state: 'Matched',
      key: 'evt-001',
    },
    {
      time: '09:39:51',
      machine: 'M02',
      file: 'festive_promo_v3.svg',
      job: 'DRP-26087',
      type: 'Job completed record',
      qty: 'Copies: 1',
      verification: 'Software record only',
      state: 'Matched',
      key: 'evt-002',
    },
    {
      time: '09:34:02',
      machine: 'M04',
      file: 'storefront_panel_02.tif',
      job: 'DRP-26082',
      type: 'Queue event',
      qty: 'Quantity unavailable',
      verification: 'Needs counter comparison',
      state: 'Unmatched',
      key: 'evt-003',
    },
    {
      time: '09:32:47',
      machine: 'M01',
      file: 'dealer_banner_oct.tif',
      job: 'DRP-26084',
      type: 'Repeated history row',
      qty: 'Same event fingerprint',
      verification: 'Not counted twice',
      state: 'Duplicate blocked',
      key: 'evt-001-dup',
    },
  ];

  private processedKeys = new Set<string>(['evt-001', 'evt-002', 'evt-003', 'evt-001-dup']);

  constructor(private readonly prisma: PrismaService) {}

  async getAll(machine?: string, state?: string): Promise<PrintEventItem[]> {
    let list = [...this.events];
    if (machine) {
      list = list.filter((e) => e.machine === machine);
    }
    if (state) {
      list = list.filter((e) => e.state === state);
    }
    return list;
  }

  async getSummary() {
    return {
      total: this.events.length,
      matched: this.events.filter((e) => e.state === 'Matched').length,
      needsVerification: this.events.filter((e) => /unverified|needs counter/i.test(e.verification)).length,
      duplicateBlocked: this.events.filter((e) => e.state === 'Duplicate blocked').length,
    };
  }

  async ingestEvent(event: any): Promise<{ acknowledged: boolean; duplicate: boolean }> {
    const key = event.eventKey || `evt-${Date.now()}`;
    if (this.processedKeys.has(key)) {
      // DUPLICATE DETECTED: Prevent duplicate increment
      this.events.unshift({
        key,
        time: new Date().toLocaleTimeString('en-GB'),
        machine: event.machineId,
        file: event.filename,
        job: event.jobId || '—',
        type: 'Duplicate machine event',
        qty: event.qtySignal || 'Repeated fingerprint',
        verification: 'Duplicate blocked · Not counted twice',
        state: 'Duplicate blocked',
      });
      return { acknowledged: true, duplicate: true };
    }

    this.processedKeys.add(key);
    this.events.unshift({
      key,
      time: new Date().toLocaleTimeString('en-GB'),
      machine: event.machineId,
      file: event.filename,
      job: event.jobId,
      type: event.eventType || 'Detected event',
      qty: event.qtySignal || 'Copies: auto-read',
      verification: event.verified || 'Physical output unverified',
      state: event.jobId ? 'Matched' : 'Unmatched',
    });

    if (this.prisma.isConnectedToDb) {
      try {
        await this.prisma.machineEvent.create({
          data: {
            eventKey: key,
            machineId: event.machineId,
            eventType: event.eventType || 'Detected event',
            filename: event.filename || 'unknown',
            productionJobId: event.jobId,
            rawPayload: JSON.stringify(event),
            qtySignal: event.qtySignal,
            verification: event.verified || 'Physical output unverified',
            state: event.jobId ? 'MATCHED' : 'UNMATCHED',
          },
        });
      } catch (err) {}
    }

    return { acknowledged: true, duplicate: false };
  }


  async simulateEvent(): Promise<PrintEventItem> {
    const key = `evt-sim-${Date.now()}`;
    const newEvent: PrintEventItem = {
      key,
      time: new Date().toLocaleTimeString('en-GB'),
      machine: 'M01',
      file: 'dealer_banner_oct.tif',
      job: 'DRP-26084',
      type: 'Simulated queue event',
      qty: 'Copies: 1 · sample only',
      verification: 'Physical output unverified',
      state: 'Matched',
    };
    this.events.unshift(newEvent);
    this.processedKeys.add(key);
    return newEvent;
  }

  async clearDemoEvents() {
    this.events = [];
    return { success: true, message: 'Demo events cleared.' };
  }
}
