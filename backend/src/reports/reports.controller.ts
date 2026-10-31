import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Reports & Exports')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('preview')
  @ApiOperation({ summary: 'Generate and preview report by filters' })
  async getPreview(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('machine') machine?: string,
    @Query('type') type?: 'production' | 'costing' | 'inventory',
  ) {
    const data = await this.reportsService.generateReport({ from, to, machine, type });
    return { success: true, data };
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export report data in CSV format' })
  async exportCsv(@Query('type') type: 'production' | 'costing' | 'inventory' = 'production', @Res() res: Response) {
    const csv = await this.reportsService.exportCsv(type);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="drp-report-${type}-${Date.now()}.csv"`);
    res.send('\ufeff' + csv);
  }
}
