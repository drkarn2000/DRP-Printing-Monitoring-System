import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MachinesService } from './machines.service';

@ApiTags('Machines')
@Controller('api/machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all seven configured printing machines with telemetry' })
  async getAll() {
    const machines = await this.machinesService.getAll();
    const onlineCount = machines.filter((m) => m.status === 'live').length;
    const totalOutput = machines.reduce((sum, m) => sum + m.output, 0);
    const exceptions = machines.filter((m) => m.status === 'error').length;
    const awaitingJob = machines.filter((m) => m.status === 'idle').length;

    return {
      success: true,
      data: machines,
      summary: {
        totalMachines: machines.length,
        onlineCount,
        totalOutput,
        exceptions,
        awaitingJob,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific machine details' })
  async getOne(@Param('id') id: string) {
    const machine = await this.machinesService.getById(id);
    return { success: true, data: machine };
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle machine connection status' })
  async toggle(@Param('id') id: string) {
    const updated = await this.machinesService.toggleStatus(id);
    return { success: true, data: updated };
  }

  @Post(':id/simulate')
  @ApiOperation({ summary: 'Simulate print counter update on machine' })
  async simulate(@Param('id') id: string, @Body() body: { amount?: number; jobId?: string }) {
    const amount = body.amount || 120;
    const updated = await this.machinesService.addOutput(id, amount, body.jobId);
    return { success: true, data: updated, amountAdded: amount };
  }
}
