import { Injectable } from '@nestjs/common';

export interface PrintExpJob {
  id: string;
  name: string;
  job: string;
  machine: string;
  dpi: string;
  size: string;
  progress: number;
  x: number;
  y: number;
  plannedCopies: number; // calculated as x * y
  status: 'Loaded' | 'Printing' | 'Finished' | 'Cancelled';
  loaded: string;
  actual: string;
  record: string;
}

@Injectable()
export class PrintExpService {
  private jobs: PrintExpJob[] = [
    {
      id: 'PX-1042',
      name: 'dealer_banner_oct.prn',
      job: 'DRP-26089',
      machine: 'M06',
      dpi: '720 × 1800',
      size: '10 × 4 ft',
      progress: 76,
      x: 2,
      y: 2,
      plannedCopies: 4, // 2 * 2 = 4
      status: 'Printing',
      loaded: '10:42:18',
      actual: '—',
      record: 'Loaded from PRN',
    },
    {
      id: 'PX-1043',
      name: 'retail_promo_02.prn',
      job: 'DRP-26091',
      machine: 'M03',
      dpi: '600 × 1200',
      size: '6 × 3 ft',
      progress: 0,
      x: 1,
      y: 3,
      plannedCopies: 3, // 1 * 3 = 3
      status: 'Loaded',
      loaded: '10:39:04',
      actual: '—',
      record: 'Awaiting start',
    },
    {
      id: 'PX-1038',
      name: 'seasonal_banner.prn',
      job: 'DRP-26084',
      machine: 'M06',
      dpi: '720 × 1800',
      size: '8 × 4 ft',
      progress: 100,
      x: 2,
      y: 2,
      plannedCopies: 4,
      status: 'Finished',
      loaded: '09:18:22',
      actual: '09:31:46',
      record: 'Print Finish',
    },
    {
      id: 'PX-1037',
      name: 'dealer_test_strip.prn',
      job: 'DRP-26082',
      machine: 'M04',
      dpi: '720 × 1200',
      size: '4 × 2 ft',
      progress: 35,
      x: 1,
      y: 2,
      plannedCopies: 2,
      status: 'Cancelled',
      loaded: '08:52:11',
      actual: '09:02:07',
      record: 'Cancelled by operator',
    },
    {
      id: 'PX-1035',
      name: 'event_backdrop.prn',
      job: 'DRP-26079',
      machine: 'M06',
      dpi: '720 × 1800',
      size: '10 × 8 ft',
      progress: 100,
      x: 3,
      y: 2,
      plannedCopies: 6,
      status: 'Finished',
      loaded: '08:14:03',
      actual: '08:28:50',
      record: 'Print Finish',
    },
  ];

  async getActiveQueue(): Promise<PrintExpJob[]> {
    return this.jobs.filter((j) => ['Loaded', 'Printing'].includes(j.status));
  }

  async getHistory(search?: string, filter?: string): Promise<PrintExpJob[]> {
    let list = this.jobs.filter((j) => ['Finished', 'Cancelled', 'Loaded'].includes(j.status));
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((j) => `${j.name} ${j.job} ${j.id}`.toLowerCase().includes(s));
    }
    if (filter) {
      list = list.filter((j) => j.status === filter);
    }
    return list;
  }

  async getDetectedSettings(id: string = 'PX-1042'): Promise<PrintExpJob> {
    const job = this.jobs.find((j) => j.id === id) || this.jobs[0];
    return job;
  }
}
