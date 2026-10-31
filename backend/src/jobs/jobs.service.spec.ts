import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('JobsService - Production Job Management', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: { isConnectedToDb: false },
        },
      ],
    }).compile();

    service = (module as any).get(JobsService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject job creation if artworkImage is missing (Mandatory Requirement)', async () => {
    await expect(
      service.create({
        id: 'TEST-001',
        art: 'banner.tif',
        artworkImage: '', // Missing image
        customer: 'Test Customer',
        machine: 'M01',
        required: 5000,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should successfully create a job with a valid artwork image', async () => {
    const job = await service.create({
      id: 'TEST-002',
      art: 'banner_valid.tif',
      artworkImage: 'data:image/svg+xml;base64,validImageData',
      customer: 'Test Customer',
      machine: 'M01',
      required: 5000,
    });
    expect(job).toBeDefined();
    expect(job.id).toBe('TEST-002');
    expect(job.status).toBe('Pending');
  });

  it('should toggle Urgent priority and support urgent-row flag', async () => {
    const job = await service.getById('DRP-26084');
    expect(job.priority).toBe('Normal');

    const updated = await service.toggleUrgent('DRP-26084');
    expect(updated.priority).toBe('Urgent');

    const reverted = await service.toggleUrgent('DRP-26084');
    expect(reverted.priority).toBe('Normal');
  });

  it('should automatically set status to Overrun when produced > required', async () => {
    const job = await service.getById('DRP-26084');
    // required is 10000, produced is 8420
    const updated = await service.addCounter('DRP-26084', 2000); // 8420 + 2000 = 10420 > 10000
    expect(updated.produced).toBe(10420);
    expect(updated.status).toBe('Overrun');
  });
});
