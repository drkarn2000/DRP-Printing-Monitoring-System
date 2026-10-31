import { Controller, Get, Post, Put, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService, ProductionJobDto } from './jobs.service';

@ApiTags('Production Jobs')
@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List all production jobs with optional search and filters' })
  async getAll(
    @Query('search') search?: string,
    @Query('machine') machine?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ) {
    const data = await this.jobsService.getAll({ search, machine, status, priority });
    return {
      success: true,
      data,
      total: data.length,
      pendingCount: data.filter((j) => j.status === 'Pending' || j.status === 'Printing').length,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed production job information' })
  async getOne(@Param('id') id: string) {
    const job = await this.jobsService.getById(id);
    return { success: true, data: job };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new production job (Artwork image is MANDATORY)' })
  @ApiResponse({ status: 201, description: 'Job created successfully.' })
  @ApiResponse({ status: 400, description: 'Artwork image is missing or job number exists.' })
  async create(@Body() dto: ProductionJobDto) {
    const job = await this.jobsService.create(dto);
    return { success: true, data: job, message: 'Production job created successfully.' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing production job' })
  async update(@Param('id') id: string, @Body() dto: Partial<ProductionJobDto>) {
    const updated = await this.jobsService.update(id, dto);
    return { success: true, data: updated, message: 'Production job updated successfully.' };
  }

  @Post(':id/toggle-urgent')
  @ApiOperation({ summary: 'Toggle Urgent priority on job (applies full red row highlighting)' })
  async toggleUrgent(@Param('id') id: string) {
    const job = await this.jobsService.toggleUrgent(id);
    return { success: true, data: job, message: `Job priority set to ${job.priority}` };
  }

  @Post(':id/counter')
  @ApiOperation({ summary: 'Increment production counter from machine detection or test simulation' })
  async addCounter(@Param('id') id: string, @Body() body: { amount?: number }) {
    const job = await this.jobsService.addCounter(id, body.amount || 120);
    return { success: true, data: job, message: `Added ${body.amount || 120} to production counter.` };
  }
}
