import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsService, PortalSettings } from './settings.service';

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current portal operational settings' })
  async getSettings() {
    const data = await this.settingsService.getSettings();
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Update portal operational settings' })
  async updateSettings(@Body() body: Partial<PortalSettings>) {
    const data = await this.settingsService.updateSettings(body);
    return { success: true, data, message: 'Settings saved successfully.' };
  }
}
