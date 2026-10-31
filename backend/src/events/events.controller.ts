import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Print Events Monitor')
@Controller('api/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of captured print events with audit verification' })
  async getAll(@Query('machine') machine?: string, @Query('state') state?: string) {
    const data = await this.eventsService.getAll(machine, state);
    const summary = await this.eventsService.getSummary();
    return { success: true, data, summary };
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simulate detection of a print event' })
  async simulate() {
    const data = await this.eventsService.simulateEvent();
    return { success: true, data };
  }

  @Post('clear')
  @ApiOperation({ summary: 'Clear demo events' })
  async clear() {
    return this.eventsService.clearDemoEvents();
  }
}
