import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventsService - Duplicate Event Prevention & Audit Trail', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: { isConnectedToDb: false },
        },
      ],
    }).compile();

    service = (module as any).get(EventsService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should accept a new event and acknowledge it', async () => {
    const result = await service.ingestEvent({
      eventKey: 'new-unique-key-12345',
      machineId: 'M01',
      filename: 'sample_banner.tif',
      jobId: 'DRP-26084',
      eventType: 'PRINT_START',
      qtySignal: 'Copies: 1',
    });
    expect(result.acknowledged).toBe(true);
    expect(result.duplicate).toBe(false);
  });

  it('should block duplicate machine event with the same eventKey', async () => {
    const key = 'dup-test-fingerprint-999';
    const first = await service.ingestEvent({
      eventKey: key,
      machineId: 'M02',
      filename: 'promo.svg',
      jobId: 'DRP-26087',
      eventType: 'PRINT_FINISH',
    });
    expect(first.duplicate).toBe(false);

    // Send identical event again
    const second = await service.ingestEvent({
      eventKey: key,
      machineId: 'M02',
      filename: 'promo.svg',
      jobId: 'DRP-26087',
      eventType: 'PRINT_FINISH',
    });
    expect(second.acknowledged).toBe(true);
    expect(second.duplicate).toBe(true);

    const all = await service.getAll();
    const blocked = all.find((e) => e.key === key && e.state === 'Duplicate blocked');
    expect(blocked).toBeDefined();
  });
});
