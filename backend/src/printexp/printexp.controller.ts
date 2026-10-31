import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrintExpService } from './printexp.service';

@ApiTags('PrintExp Integration')
@Controller('api/printexp')
export class PrintExpController {
  constructor(private readonly printexpService: PrintExpService) {}

  @Get('queue')
  @ApiOperation({ summary: 'Get active PRN print job queue loaded in PrintExp' })
  async getQueue() {
    const data = await this.printexpService.getActiveQueue();
    return { success: true, data };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get PrintExp print history list with completed and cancelled records' })
  async getHistory(@Query('search') search?: string, @Query('status') status?: string) {
    const data = await this.printexpService.getHistory(search, status);
    return { success: true, data };
  }

  @Get('settings/:id')
  @ApiOperation({ summary: 'Get automatically detected PRN settings (DPI, X/Y copies, planned copies)' })
  async getDetectedSettings(@Param('id') id: string) {
    const data = await this.printexpService.getDetectedSettings(id);
    return { success: true, data };
  }
}
