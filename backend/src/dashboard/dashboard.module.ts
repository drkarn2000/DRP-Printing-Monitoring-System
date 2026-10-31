import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { JobsModule } from '../jobs/jobs.module';
import { MachinesModule } from '../machines/machines.module';
import { CostingModule } from '../costing/costing.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [JobsModule, MachinesModule, CostingModule, NotificationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
