import * as fs from 'fs';
import * as path from 'path';
import { PrintEventPayload } from './types';

export class LocalEventQueue {
  private queue: PrintEventPayload[] = [];
  private readonly filePath: string;

  constructor(storageDir: string = path.join(__dirname, '..')) {
    this.filePath = path.join(storageDir, 'connector_queue.json');
    this.load();
  }

  enqueue(event: PrintEventPayload): void {
    // Avoid enqueuing duplicate eventKeys
    if (!this.queue.some(e => e.eventKey === event.eventKey)) {
      this.queue.push(event);
      this.save();
    }
  }

  dequeueBatch(count: number = 20): PrintEventPayload[] {
    return this.queue.slice(0, count);
  }

  acknowledgeBatch(acknowledgedKeys: string[]): void {
    const keySet = new Set(acknowledgedKeys);
    this.queue = this.queue.filter(e => !keySet.has(e.eventKey));
    this.save();
  }

  size(): number {
    return this.queue.length;
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.queue, null, 2), 'utf8');
    } catch (e) {
      console.warn(`[LocalEventQueue] Could not persist queue:`, e);
    }
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.queue = JSON.parse(raw);
        console.log(`[LocalEventQueue] Loaded ${this.queue.length} pending events from disk.`);
      }
    } catch (e) {
      this.queue = [];
    }
  }
}
