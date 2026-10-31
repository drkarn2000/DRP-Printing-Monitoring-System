import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CostingService } from './costing.service';

@ApiTags('Costing & Wastage')
@Controller('api/costing')
export class CostingController {
  constructor(private readonly costingService: CostingService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall costing KPIs (production cost, ink consumed, wastage cost)' })
  async getSummary(@Query('filter') filter?: 'today' | 'all') {
    const data = await this.costingService.getSummary(filter);
    return { success: true, data };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get cost configuration rates for ink, print heads and materials' })
  async getConfig() {
    const data = await this.costingService.getConfigItems();
    return { success: true, data };
  }

  @Post('config')
  @ApiOperation({ summary: 'Add a new rate to cost configuration' })
  async addConfigItem(@Body() body: any) {
    const item = await this.costingService.addConfigItem(body);
    return { success: true, data: item, message: 'Cost rate added successfully.' };
  }

  @Put('config/:id')
  @ApiOperation({ summary: 'Update an existing cost rate' })
  async updateConfigItem(@Param('id') id: string, @Body() body: { rate: number }) {
    const item = await this.costingService.updateConfigItem(id, Number(body.rate));
    return { success: true, data: item, message: 'Cost rate updated successfully.' };
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get job-wise costing and wastage calculation table' })
  async getJobCosting(@Query('filter') filter?: 'today' | 'all') {
    const data = await this.costingService.getJobCosting(filter);
    return { success: true, data };
  }
}
