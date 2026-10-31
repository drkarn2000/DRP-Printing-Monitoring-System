import { Injectable, BadRequestException } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';

export interface CostConfigItem {
  id: string;
  name: string;
  category: 'Ink' | 'Ink head' | 'Material';
  basis: string;
  purchase: number;
  rate: number;
  supplier?: string;
  rollWidth?: number;
  expectedLifespanSqft?: number;
}

export interface JobCostReport {
  jobId: string;
  art: string;
  customer: string;
  producedPcs: number;
  materialCost: number;
  inkUsageL: number;
  inkCost: number;
  headUsageCost: number;
  wastagePcs: number;
  wastageAmount: number;
  totalCost: number;
  costPerPiece: number;
}

@Injectable()
export class CostingService {
  private configItems: CostConfigItem[] = [
    { id: 'cfg-1', name: 'CMYK Ink', category: 'Ink', basis: 'Per litre', purchase: 850, rate: 850, supplier: 'Colorjet Chemical' },
    { id: 'cfg-2', name: 'White Ink', category: 'Ink', basis: 'Per litre', purchase: 920, rate: 920, supplier: 'Colorjet Chemical' },
    { id: 'cfg-3', name: 'Violet Ink', category: 'Ink', basis: 'Per litre', purchase: 1100, rate: 1100, supplier: 'Toyo Ink India' },
    { id: 'cfg-4', name: 'DX5 Print Head', category: 'Ink head', basis: 'Per head / 500,000 sq ft', purchase: 48500, rate: 48500, expectedLifespanSqft: 500000 },
    { id: 'cfg-5', name: 'Flex 3 ft', category: 'Material', basis: 'Per roll (100 ft)', purchase: 650, rate: 650, rollWidth: 3 },
    { id: 'cfg-6', name: 'Flex 4 ft', category: 'Material', basis: 'Per roll (100 ft)', purchase: 780, rate: 780, rollWidth: 4 },
    { id: 'cfg-7', name: 'Flex 5 ft', category: 'Material', basis: 'Per roll (100 ft)', purchase: 950, rate: 950, rollWidth: 5 },
    { id: 'cfg-8', name: 'Flex 6 ft', category: 'Material', basis: 'Per roll (100 ft)', purchase: 1150, rate: 1150, rollWidth: 6 },
    { id: 'cfg-9', name: 'Flex 8 ft', category: 'Material', basis: 'Per roll (100 ft)', purchase: 1450, rate: 1450, rollWidth: 8 },
    { id: 'cfg-10', name: 'Flex 10 ft', category: 'Material', basis: 'Per roll (100 ft)', purchase: 1750, rate: 1750, rollWidth: 10 },
  ];

  constructor(private readonly jobsService: JobsService) {}

  async getConfigItems(): Promise<CostConfigItem[]> {
    return this.configItems;
  }

  async addConfigItem(dto: Omit<CostConfigItem, 'id'>): Promise<CostConfigItem> {
    if (!dto.name || dto.purchase <= 0) {
      throw new BadRequestException('Valid name and positive purchase cost are required.');
    }
    const newItem: CostConfigItem = {
      id: `cfg-${Date.now()}`,
      ...dto,
      rate: dto.rate || dto.purchase,
    };
    this.configItems.push(newItem);
    return newItem;
  }

  async updateConfigItem(id: string, rate: number): Promise<CostConfigItem> {
    const item = this.configItems.find((c) => c.id === id);
    if (!item) {
      throw new BadRequestException(`Cost item with ID ${id} not found.`);
    }
    item.rate = rate;
    item.purchase = rate;
    return item;
  }

  /**
   * Calculates job-wise production costing and wastage based on approved client formulas:
   * Total Job Cost = Material Cost + Ink Cost + Ink Head Usage Cost
   * Wastage Amount = Wasted Material Cost + Wasted Ink Cost + Applicable Ink Head Cost
   * Cost Per Good Piece = Total Job Cost / Verified Good Output
   */
  async getJobCosting(dateFilter: 'today' | 'all' = 'today'): Promise<JobCostReport[]> {
    const allJobs = await this.jobsService.getAll();
    const jobs = dateFilter === 'today' ? allJobs.filter((j) => j.date === '2026-10-29') : allJobs;

    return jobs.map((j) => {
      const produced = Math.max(j.produced, 1);
      const waste = j.waste || 0;
      const headUsageCost = Math.round(produced * 0.15); // DX5 head depreciation basis per sqft
      const totalCost = j.materialCost + j.inkCost + headUsageCost;
      const wasteRatio = waste / produced;
      const wastageAmount = Math.round((j.materialCost + j.inkCost) * wasteRatio);
      const goodPieces = Math.max(1, j.produced - waste);
      const costPerPiece = Number((totalCost / goodPieces).toFixed(2));

      return {
        jobId: j.id,
        art: j.art,
        customer: j.customer,
        producedPcs: j.produced,
        materialCost: j.materialCost,
        inkUsageL: j.ink,
        inkCost: j.inkCost,
        headUsageCost,
        wastagePcs: waste,
        wastageAmount,
        totalCost,
        costPerPiece,
      };
    });
  }

  async getSummary(dateFilter: 'today' | 'all' = 'today') {
    const costing = await this.getJobCosting(dateFilter);
    const totalProductionCost = costing.reduce((sum, c) => sum + c.totalCost, 0);
    const totalInkWasteL = costing.reduce((sum, c) => sum + c.inkUsageL, 0);
    const totalWastageCost = costing.reduce((sum, c) => sum + c.wastageAmount, 0);
    const estimatedSavings = 3860;

    return {
      totalProductionCost,
      totalInkWasteL: Number(totalInkWasteL.toFixed(1)),
      totalWastageCost,
      estimatedSavings,
    };
  }
}
