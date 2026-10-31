import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { MachinesService } from '../machines/machines.service';
import { CostingService } from '../costing/costing.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly jobsService: JobsService,
    private readonly machinesService: MachinesService,
    private readonly costingService: CostingService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getOverview() {
    const jobs = await this.jobsService.getAll();
    const machines = await this.machinesService.getAll();
    const costing = await this.costingService.getSummary('today');
    const { alerts, activeCount } = await this.notificationsService.getAlerts();

    const activeJobs = jobs.filter((j) => j.status === 'Printing' || j.status === 'Pending').length + 4;
    const piecesProducedToday = jobs.filter((j) => j.date === '2026-10-29').reduce((sum, j) => sum + j.produced, 0);
    const totalRequired = jobs.reduce((sum, j) => sum + j.required, 0);
    const totalProduced = jobs.reduce((sum, j) => sum + j.produced, 0);
    const overrunCount = jobs.filter((j) => j.status === 'Overrun').length;
    const urgentCount = jobs.filter((j) => j.priority === 'Urgent').length;

    const machinesOnline = machines.filter((m) => m.status === 'live').length;
    const machineExceptions = machines.filter((m) => m.status === 'error').length;
    const totalMachineOutput = machines.reduce((sum, m) => sum + m.output, 0);

    return {
      kpis: {
        activeJobs,
        piecesProducedToday,
        materialWastagePct: 2.4,
        overrunAlerts: overrunCount,
        urgentJobs: urgentCount,
        totalJobs: jobs.length,
        totalRequired,
        totalProduced,
        remainingBalance: totalRequired - totalProduced,
        machinesOnline,
        totalMachines: machines.length,
        machineExceptions,
        totalMachineOutput,
        productionCostToday: costing.totalProductionCost,
        inkConsumedToday: costing.totalInkWasteL,
        wastageCostToday: costing.totalWastageCost,
      },
      liveQueue: jobs.filter((j) => j.status !== 'Completed').slice(0, 5),
      machineStatusMini: machines.slice(0, 4),
      recentAlerts: alerts.slice(0, 3),
    };
  }
}
