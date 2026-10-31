import { Injectable } from '@nestjs/common';

export interface AlertItem {
  id: string;
  type: 'red' | 'amber';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export interface ActivityItem {
  id?: string;
  title: string;
  desc: string;
  time: string;
}

@Injectable()
export class NotificationsService {
  private alerts: AlertItem[] = [
    {
      id: 'alt-1',
      type: 'red',
      title: 'Production overrun detected',
      desc: 'DRP-26091 · winter_sale_front.tif exceeded target by 200 pcs.',
      time: '2 min ago',
      read: false,
    },
    {
      id: 'alt-2',
      type: 'red',
      title: 'Production overrun detected',
      desc: 'DRP-26089 · clearance_window.svg exceeded target by 630 pcs.',
      time: '8 min ago',
      read: false,
    },
    {
      id: 'alt-3',
      type: 'amber',
      title: 'Machine connection lost',
      desc: 'HP Latex 1500 (M07) has not sent a heartbeat for 2 minutes.',
      time: '2 min ago',
      read: false,
    },
    {
      id: 'alt-4',
      type: 'amber',
      title: 'Low ink stock',
      desc: 'White Ink is below the configured minimum reserve.',
      time: 'Today, 08:15',
      read: true,
    },
  ];

  private activities: ActivityItem[] = [
    { id: 'act-1', title: 'Print counter updated', desc: 'Colorjet SoniQ Solvent · DRP-26084 · +120 pcs', time: '3 sec ago' },
    { id: 'act-2', title: 'Job marked urgent', desc: 'DRP-26087 · Urban Mart', time: '12 min ago' },
    { id: 'act-3', title: 'Artwork detected', desc: 'festive_promo_v3.svg · server history', time: '18 min ago' },
    { id: 'act-4', title: 'Stock purchase recorded', desc: 'CMYK Ink · +20 litres', time: '45 min ago' },
  ];


  async getAlerts() {
    return {
      alerts: this.alerts,
      activeCount: this.alerts.filter((a) => !a.read).length,
      activity: this.activities,
    };
  }

  async markRead(id: string) {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.read = true;
    }
    return { success: true, alert };
  }

  async markAllRead() {
    this.alerts.forEach((a) => (a.read = true));
    return { success: true, message: 'All alerts marked as reviewed.' };
  }

  async addAlert(alert: Omit<AlertItem, 'id' | 'read'>) {
    const newAlert: AlertItem = {
      id: `alt-${Date.now()}`,
      read: false,
      ...alert,
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }
}
