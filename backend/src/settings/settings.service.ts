import { Injectable } from '@nestjs/common';

export interface PortalSettings {
  overrunThreshold: number; // 0: immediate, 1: 1%, 2: 2%
  refreshInterval: string;
  shiftEnd: string;
  autoAlerts: boolean;
  emailAlerts: boolean;
  serverHost: string;
  historyRetention: string;
}

@Injectable()
export class SettingsService {
  private settings: PortalSettings = {
    overrunThreshold: 0,
    refreshInterval: '5 seconds',
    shiftEnd: '18:00',
    autoAlerts: true,
    emailAlerts: true,
    serverHost: '192.168.1.10',
    historyRetention: '2 days (client current system)',
  };

  async getSettings(): Promise<PortalSettings> {
    return this.settings;
  }

  async updateSettings(dto: Partial<PortalSettings>): Promise<PortalSettings> {
    this.settings = { ...this.settings, ...dto };
    return this.settings;
  }
}
