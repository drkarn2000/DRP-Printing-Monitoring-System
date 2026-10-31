import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MachinesModule } from './machines/machines.module';
import { JobsModule } from './jobs/jobs.module';
import { ArtworkModule } from './artwork/artwork.module';
import { PrintExpModule } from './printexp/printexp.module';
import { EventsModule } from './events/events.module';
import { ConnectorModule } from './connector/connector.module';
import { WorkflowModule } from './workflow/workflow.module';
import { InventoryModule } from './inventory/inventory.module';
import { CostingModule } from './costing/costing.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './gateway/realtime.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    MachinesModule,
    JobsModule,
    ArtworkModule,
    PrintExpModule,
    EventsModule,
    ConnectorModule,
    WorkflowModule,
    InventoryModule,
    CostingModule,
    ReportsModule,
    NotificationsModule,
    RealtimeModule,
    DashboardModule,
    SettingsModule,
  ],
})
export class AppModule {}
