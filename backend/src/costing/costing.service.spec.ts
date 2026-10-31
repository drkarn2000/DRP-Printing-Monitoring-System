import { Test, TestingModule } from '@nestjs/testing';
import { CostingService } from './costing.service';
import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CostingService - Automatic Costing and Wastage Calculation', () => {
  let service: CostingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostingService,
        JobsService,
        {
          provide: PrismaService,
          useValue: { isConnectedToDb: false },
        },
      ],
    }).compile();

    service = (module as any).get(CostingService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compute Total Job Cost using Material Cost + Ink Cost + Head Usage Cost', async () => {
    const reports = await service.getJobCosting('all');
    expect(reports.length).toBeGreaterThan(0);

    const first = reports[0];
    expect(first.totalCost).toBe(first.materialCost + first.inkCost + first.headUsageCost);
  });

  it('should compute Wastage Amount correctly based on waste ratio', async () => {
    const reports = await service.getJobCosting('all');
    const first = reports[0];
    const wasteRatio = first.wastagePcs / first.producedPcs;
    const expectedWastageAmount = Math.round((first.materialCost + first.inkCost) * wasteRatio);
    expect(first.wastageAmount).toBe(expectedWastageAmount);
  });

  it('should allow adding new ink rate without breaking historical rates', async () => {
    const newItem = await service.addConfigItem({
      name: 'Eco-Sol Max Cyan',
      category: 'Ink',
      basis: 'Per litre',
      purchase: 980,
      rate: 980,
      supplier: 'Roland DG',
    });
    expect(newItem.id).toBeDefined();
    expect(newItem.rate).toBe(980);

    const all = await service.getConfigItems();
    expect(all.some((c) => c.name === 'Eco-Sol Max Cyan')).toBe(true);
  });
});
