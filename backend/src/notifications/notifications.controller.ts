import { Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Alerts & Activity')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active overrun, offline, and inventory alerts with activity feed' })
  async getAlerts() {
    const data = await this.notificationsService.getAlerts();
    return { success: true, data };
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark specific alert as reviewed' })
  async markRead(@Param('id') id: string) {
    const res = await this.notificationsService.markRead(id);
    return res;
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all active alerts as reviewed' })
  async markAllRead() {
    const res = await this.notificationsService.markAllRead();
    return res;
  }
}
