import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard Overview')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get aggregated dashboard metrics, live queue, machine mini status and alerts' })
  async getOverview() {
    const data = await this.dashboardService.getOverview();
    return { success: true, data };
  }
}
