import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { JobsModule } from '../jobs/jobs.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CostingModule } from '../costing/costing.module';
import { MachinesModule } from '../machines/machines.module';

@Module({
  imports: [JobsModule, InventoryModule, CostingModule, MachinesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
