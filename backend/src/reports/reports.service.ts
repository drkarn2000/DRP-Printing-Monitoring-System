import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { InventoryService } from '../inventory/inventory.service';
import { CostingService } from '../costing/costing.service';
import { MachinesService } from '../machines/machines.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly jobsService: JobsService,
    private readonly inventoryService: InventoryService,
    private readonly costingService: CostingService,
    private readonly machinesService: MachinesService,
  ) {}

  async generateReport(query: {
    from?: string;
    to?: string;
    machine?: string;
    type?: 'production' | 'costing' | 'inventory';
  }) {
    const reportType = query.type || 'production';
    const allJobs = await this.jobsService.getAll();
    const machines = await this.machinesService.getAll();

    let filteredJobs = allJobs;
    if (query.machine) {
      filteredJobs = filteredJobs.filter((j) => j.machine === query.machine);
    }

    const totalRequired = filteredJobs.reduce((sum, j) => sum + j.required, 0);
    const totalProduced = filteredJobs.reduce((sum, j) => sum + j.produced, 0);
    const remainingBalance = totalRequired - totalProduced;

    if (reportType === 'inventory') {
      const stock = await this.inventoryService.getStock();
      return {
        type: 'inventory',
        data: stock,
        summary: {
          totalItems: stock.length,
          totalValue: stock.reduce((s, i) => s + i.stockValue, 0),
        },
      };
    }

    if (reportType === 'costing') {
      const costing = await this.costingService.getJobCosting('all');
      return {
        type: 'costing',
        data: costing,
        summary: {
          totalCost: costing.reduce((s, c) => s + c.totalCost, 0),
          totalWastageAmount: costing.reduce((s, c) => s + c.wastageAmount, 0),
        },
      };
    }

    return {
      type: 'production',
      subtitle: `Production summary · ${query.from || '2026-10-29'} to ${query.to || 'Today'}`,
      summary: {
        jobsCount: filteredJobs.length,
        totalRequired,
        totalProduced,
        remainingBalance,
      },
      data: filteredJobs.map((j) => {
        const machine = machines.find((m) => m.id === j.machine);
        return {
          id: j.id,
          art: j.art,
          machineId: j.machine,
          machineName: machine?.name || j.machine,
          customer: j.customer,
          required: j.required,
          produced: j.produced,
          balance: j.required - j.produced,
          status: j.status,
        };
      }),
    };
  }

  async exportCsv(type: 'production' | 'costing' | 'inventory'): Promise<string> {
    if (type === 'costing') {
      const items = await this.costingService.getJobCosting('all');
      const headers = ['Job Number', 'Artwork', 'Customer', 'Produced Pcs', 'Material Cost INR', 'Ink Litres', 'Ink Cost INR', 'Head Usage Cost INR', 'Wastage Pcs', 'Wastage Amount INR', 'Total Cost INR', 'Cost Per Good Piece'];
      const rows = items.map((i) => [
        i.jobId,
        `"${i.art}"`,
        `"${i.customer}"`,
        i.producedPcs,
        i.materialCost,
        i.inkUsageL,
        i.inkCost,
        i.headUsageCost,
        i.wastagePcs,
        i.wastageAmount,
        i.totalCost,
        i.costPerPiece,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    }

    if (type === 'inventory') {
      const items = await this.inventoryService.getStock();
      const headers = ['Material', 'Category', 'Available Stock', 'Unit', 'Unit Cost INR', 'Stock Value INR', 'Status'];
      const rows = items.map((i) => [
        `"${i.name}"`,
        i.type,
        i.qty,
        i.unit,
        i.cost,
        i.stockValue,
        i.status,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    }

    const report = await this.generateReport({ type: 'production' });
    const headers = ['Job Number', 'Artwork', 'Machine', 'Customer', 'Required', 'Produced', 'Balance', 'Status'];
    const rows = (report.data as any[]).map((j) => [
      j.id,
      `"${j.art}"`,
      `"${j.machineName}"`,
      `"${j.customer}"`,
      j.required,
      j.produced,
      j.balance,
      j.status,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}
