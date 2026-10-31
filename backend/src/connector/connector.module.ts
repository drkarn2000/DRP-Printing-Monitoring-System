import { Module } from '@nestjs/common';
import { ConnectorController } from './connector.controller';
import { EventsModule } from '../events/events.module';
import { MachinesModule } from '../machines/machines.module';

@Module({
  imports: [EventsModule, MachinesModule],
  controllers: [ConnectorController],
})
export class ConnectorModule {}
