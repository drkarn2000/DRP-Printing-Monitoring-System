import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProductionJobDto {
  id: string;
  art: string;
  artworkImage: string; // MANDATORY
  customer: string;
  dealer?: string;
  machine: string;
  required: number;
  produced?: number;
  status?: 'Pending' | 'Printing' | 'Completed' | 'Overrun' | 'Cancelled';
  priority?: 'Normal' | 'Urgent';
  dims?: string;
  date?: string;
  format?: string;
  ink?: number;
  materialCost?: number;
  inkCost?: number;
  waste?: number;
  notes?: string;
}

@Injectable()
export class JobsService {
  private jobs: ProductionJobDto[] = [
    {
      id: 'DRP-26084',
      art: 'dealer_banner_oct.tif',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20x2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23e6ebff%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23c9f4eb%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22url%28%23g%29%22/%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%22136%22%20height%3D%2276%22%20rx%3D%228%22%20fill%3D%22%23fff%22%20opacity%3D%22.72%22/%3E%3Cpath%20d%3D%22M22%2067%20L55%2036%20L78%2057%20L98%2043%20L138%2076%20L22%2076Z%22%20fill%3D%22%237588dc%22/%3E%3Ccircle%20cx%3D%22118%22%20cy%3D%2230%22%20r%3D%229%22%20fill%3D%22%23f0b65c%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2294%22%20font-size%3D%227%22%20text-anchor%3D%22middle%22%20fill%3D%22%2353617c%22%3ENORTHSTAR%20DEALER%20BANNER%3C/text%3E%3C/svg%3E',
      customer: 'Northstar Retail',
      dealer: 'Ludhiana Central',
      machine: 'M01',
      required: 10000,
      produced: 8420,
      status: 'Printing',
      priority: 'Normal',
      dims: '4 × 8 ft',
      date: '2026-10-29',
      format: 'TIFF',
      ink: 2.1,
      materialCost: 1450,
      inkCost: 680,
      waste: 110,
    },
    {
      id: 'DRP-26087',
      art: 'festive_promo_v3.svg',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20x2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23ffebee%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23ffcdd2%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22url%28%23g%29%22/%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2250%22%20r%3D%2230%22%20fill%3D%22%23e53935%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2254%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%23fff%22%20font-weight%3D%22bold%22%3EFESTIVE%20PROMO%3C/text%3E%3C/svg%3E',
      customer: 'Urban Mart',
      dealer: 'Mohali Phase 7',
      machine: 'M02',
      required: 8000,
      produced: 6250,
      status: 'Printing',
      priority: 'Urgent',
      dims: '3 × 6 ft',
      date: '2026-10-29',
      format: 'SVG',
      ink: 1.7,
      materialCost: 980,
      inkCost: 550,
      waste: 85,
    },
    {
      id: 'DRP-26091',
      art: 'winter_sale_front.tif',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22%23e0f2f1%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2255%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%2300695c%22%20font-weight%3D%22bold%22%3EWINTER%20SALE%3C/text%3E%3C/svg%3E',
      customer: 'Northstar Retail',
      dealer: 'Zirakpur',
      machine: 'M03',
      required: 5000,
      produced: 5200,
      status: 'Overrun',
      priority: 'Urgent',
      dims: '4 × 4 ft',
      date: '2026-10-29',
      format: 'TIFF',
      ink: 1.4,
      materialCost: 760,
      inkCost: 420,
      waste: 200,
    },
    {
      id: 'DRP-26082',
      art: 'storefront_panel_02.tif',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22%23ede7f6%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2255%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%234527a0%22%20font-weight%3D%22bold%22%3ESTOREFRONT%3C/text%3E%3C/svg%3E',
      customer: 'Metro Wholesale',
      dealer: 'Chandigarh 17',
      machine: 'M04',
      required: 6000,
      produced: 3960,
      status: 'Printing',
      priority: 'Normal',
      dims: '8 × 10 ft',
      date: '2026-10-29',
      format: 'TIFF',
      ink: 1.8,
      materialCost: 1800,
      inkCost: 590,
      waste: 90,
    },
    {
      id: 'DRP-26089',
      art: 'clearance_window.svg',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22%23fff3e0%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2255%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%23e65100%22%20font-weight%3D%22bold%22%3ECLEARANCE%3C/text%3E%3C/svg%3E',
      customer: 'Value Avenue',
      dealer: 'Panchkula',
      machine: 'M06',
      required: 4000,
      produced: 4630,
      status: 'Overrun',
      priority: 'Urgent',
      dims: '3 × 8 ft',
      date: '2026-10-29',
      format: 'SVG',
      ink: 1.6,
      materialCost: 820,
      inkCost: 510,
      waste: 160,
    },
    {
      id: 'DRP-26078',
      art: 'brand_wall_final.tif',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22%23e8eaf6%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2255%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%231a237e%22%20font-weight%3D%22bold%22%3EBRAND%20WALL%3C/text%3E%3C/svg%3E',
      customer: 'BluePeak Foods',
      dealer: 'Industrial Area',
      machine: 'M01',
      required: 3000,
      produced: 3000,
      status: 'Completed',
      priority: 'Normal',
      dims: '6 × 8 ft',
      date: '2026-10-28',
      format: 'TIFF',
      ink: 1.2,
      materialCost: 920,
      inkCost: 390,
      waste: 40,
    },
    {
      id: 'DRP-26080',
      art: 'menu_board_set.svg',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22%23fbe9e7%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2255%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%23bf360c%22%20font-weight%3D%22bold%22%3EMENU%20BOARD%3C/text%3E%3C/svg%3E',
      customer: 'Cafe 24',
      dealer: 'Sector 24',
      machine: 'M02',
      required: 2500,
      produced: 0,
      status: 'Pending',
      priority: 'Normal',
      dims: '2 × 3 ft',
      date: '2026-10-29',
      format: 'SVG',
      ink: 0,
      materialCost: 0,
      inkCost: 0,
      waste: 0,
    },
    {
      id: 'DRP-26076',
      art: 'outlet_directional.tif',
      artworkImage:
        'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22160%22%20height%3D%22100%22%3E%3Crect%20width%3D%22160%22%20height%3D%22100%22%20rx%3D%2212%22%20fill%3D%22%23f3e5f5%22/%3E%3Ctext%20x%3D%2280%22%20y%3D%2255%22%20font-size%3D%229%22%20text-anchor%3D%22middle%22%20fill%3D%22%234a148c%22%20font-weight%3D%22bold%22%3EDIRECTIONAL%3C/text%3E%3C/svg%3E',
      customer: 'Metro Wholesale',
      dealer: 'Ambala Road',
      machine: 'M05',
      required: 4500,
      produced: 0,
      status: 'Pending',
      priority: 'Normal',
      dims: '3 × 5 ft',
      date: '2026-10-29',
      format: 'TIFF',
      ink: 0,
      materialCost: 0,
      inkCost: 0,
      waste: 0,
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getAll(query?: { search?: string; machine?: string; status?: string; priority?: string }): Promise<ProductionJobDto[]> {
    if (this.prisma.isConnectedToDb) {
      try {
        const dbJobs = await this.prisma.productionJob.findMany({ orderBy: { createdAt: 'desc' } });
        if (dbJobs && dbJobs.length > 0) {
          for (const dj of dbJobs) {
            if (!this.jobs.some((j) => j.id === dj.id)) {
              this.jobs.push({
                id: dj.id,
                art: dj.artworkName,
                artworkImage: dj.artworkImage,
                customer: dj.customerName,
                dealer: dj.dealer || '—',
                machine: dj.machineId,
                required: dj.requiredQty,
                produced: dj.producedQty,
                status: (dj.status.charAt(0) + dj.status.slice(1).toLowerCase()) as any,
                priority: (dj.priority.charAt(0) + dj.priority.slice(1).toLowerCase()) as any,
                dims: dj.dimensions || '4 × 8 ft',
                date: dj.createdAt.toISOString().split('T')[0],
                format: dj.format,
                ink: dj.inkConsumedL,
                materialCost: dj.materialCost,
                inkCost: dj.inkCost,
                waste: dj.wastedQty,
              });
            }
          }
        }
      } catch (err) {}
    }

    let list = [...this.jobs];
    if (query?.search) {
      const s = query.search.toLowerCase();
      list = list.filter((j) => `${j.id} ${j.art} ${j.customer} ${j.dealer}`.toLowerCase().includes(s));
    }
    if (query?.machine) {
      list = list.filter((j) => j.machine === query.machine);
    }
    if (query?.status) {
      list = list.filter((j) => j.status === query.status);
    }
    if (query?.priority) {
      list = list.filter((j) => j.priority === query.priority);
    }
    return list;
  }

  async getById(id: string): Promise<ProductionJobDto> {
    const job = this.jobs.find((j) => j.id === id);
    if (!job) {
      throw new NotFoundException(`Production job ${id} not found`);
    }
    return job;
  }

  async create(dto: ProductionJobDto): Promise<ProductionJobDto> {
    // ENFORCE MANDATORY ARTWORK IMAGE REQUIREMENT
    // "Artwork image is mandatory. A user must not be able to create a production job without uploading or selecting an artwork image."
    if (!dto.artworkImage || dto.artworkImage.trim() === '') {
      throw new BadRequestException('Artwork image is mandatory. A job cannot be created without an image.');
    }
    if (!dto.id) {
      dto.id = `DRP-${Math.floor(26000 + Math.random() * 900)}`;
    }
    if (this.jobs.some((j) => j.id === dto.id)) {
      throw new BadRequestException(`Job number ${dto.id} already exists. Choose a unique number.`);
    }

    const newJob: ProductionJobDto = {
      id: dto.id,
      art: dto.art || 'artwork.tif',
      artworkImage: dto.artworkImage,
      customer: dto.customer,
      dealer: dto.dealer || '—',
      machine: dto.machine || 'M01',
      required: Number(dto.required) || 1000,
      produced: Number(dto.produced) || 0,
      status: dto.status || 'Pending',
      priority: dto.priority || 'Normal',
      dims: dto.dims || '4 × 8 ft',
      date: dto.date || new Date().toISOString().split('T')[0],
      format: (dto.art || '').toLowerCase().endsWith('.svg') ? 'SVG' : 'TIFF',
      ink: 0,
      materialCost: 0,
      inkCost: 0,
      waste: 0,
      notes: dto.notes || '',
    };

    this.jobs.unshift(newJob);

    if (this.prisma.isConnectedToDb) {
      try {
        await this.prisma.productionJob.create({
          data: {
            id: newJob.id,
            artworkName: newJob.art,
            artworkFile: newJob.art,
            artworkImage: newJob.artworkImage,
            customerName: newJob.customer,
            dealer: newJob.dealer,
            machineId: newJob.machine,
            requiredQty: newJob.required,
            producedQty: newJob.produced || 0,
            status: (newJob.status?.toUpperCase() || 'PENDING') as any,
            priority: (newJob.priority?.toUpperCase() || 'NORMAL') as any,
            dimensions: newJob.dims,
            format: newJob.format || 'TIFF',
          },
        });
      } catch (err) {}
    }

    return newJob;
  }


  async update(id: string, dto: Partial<ProductionJobDto>): Promise<ProductionJobDto> {
    const job = await this.getById(id);
    Object.assign(job, dto);

    // Update status if produced exceeds required
    if (job.produced > job.required) {
      job.status = 'Overrun';
    } else if (job.produced >= job.required && job.status === 'Printing') {
      job.status = 'Completed';
    }

    return job;
  }

  async toggleUrgent(id: string): Promise<ProductionJobDto> {
    const job = await this.getById(id);
    job.priority = job.priority === 'Urgent' ? 'Normal' : 'Urgent';
    return job;
  }

  async addCounter(id: string, amount: number = 120): Promise<ProductionJobDto> {
    const job = await this.getById(id);
    job.produced += amount;
    if (job.produced > job.required) {
      job.status = 'Overrun';
    } else if (job.produced >= job.required) {
      job.status = 'Completed';
    } else if (job.status === 'Pending') {
      job.status = 'Printing';
    }
    return job;
  }
}
