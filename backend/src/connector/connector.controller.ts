import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventsService } from '../events/events.service';
import { MachinesService } from '../machines/machines.service';

@ApiTags('Machine Connector API')
@Controller('api/connector')
export class ConnectorController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly machinesService: MachinesService,
  ) {}

  @Post('heartbeat')
  @ApiOperation({ summary: 'Receive heartbeat from Windows Machine Connector agent' })
  async heartbeat(@Headers('x-connector-key') key: string, @Body() payload: any) {
    if (key !== (process.env.CONNECTOR_API_KEY || 'drp-connector-api-key-safe-2026')) {
      throw new UnauthorizedException('Invalid connector API key');
    }

    if (payload.machines && Array.isArray(payload.machines)) {
      for (const m of payload.machines) {
        await this.machinesService.updateHeartbeat(m.machineId, m.status.toLowerCase(), m.outputToday);
      }
    }

    return {
      success: true,
      serverTime: new Date().toISOString(),
      status: 'SYNCHRONIZED',
    };
  }

  @Post('events/batch')
  @ApiOperation({ summary: 'Batch ingest print events from local connector' })
  async batchEvents(@Headers('x-connector-key') key: string, @Body() payload: { events: any[] }) {
    if (key !== (process.env.CONNECTOR_API_KEY || 'drp-connector-api-key-safe-2026')) {
      throw new UnauthorizedException('Invalid connector API key');
    }

    const acknowledgedKeys: string[] = [];
    if (payload.events && Array.isArray(payload.events)) {
      for (const ev of payload.events) {
        const res = await this.eventsService.ingestEvent(ev);
        if (res.acknowledged) {
          acknowledgedKeys.push(ev.eventKey);
        }
      }
    }

    return {
      success: true,
      acknowledgedKeys,
      count: acknowledgedKeys.length,
    };
  }
}
