import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';

@ApiTags('RIP to Print Workflow')
@Controller('api/workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('state')
  @ApiOperation({ summary: 'Get current RIP to Print workflow stage and log history' })
  async getState() {
    const data = await this.workflowService.getState();
    return { success: true, data };
  }

  @Post('advance')
  @ApiOperation({ summary: 'Advance to next workflow step' })
  async advance() {
    const data = await this.workflowService.advanceStep();
    return { success: true, data };
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset workflow stages to beginning' })
  async reset() {
    const data = await this.workflowService.reset();
    return { success: true, data };
  }

  @Post('context')
  @ApiOperation({ summary: 'Change selected job or machine for workflow demonstration' })
  async changeContext(@Body() body: { jobId?: string; machineId?: string }) {
    if (body.jobId) await this.workflowService.selectJob(body.jobId);
    if (body.machineId) await this.workflowService.selectMachine(body.machineId);
    const data = await this.workflowService.getState();
    return { success: true, data };
  }
}
