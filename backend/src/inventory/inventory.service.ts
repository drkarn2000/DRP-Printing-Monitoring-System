import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StockItem {
  id?: string;
  name: string;
  type: 'ink' | 'roll';
  qty: number;
  unit: string;
  cost: number;
  min: number;
  rollWidth?: number; // 3, 4, 5, 6, 8, 10 ft
}

export interface StockMovement {
  id?: string;
  material: string;
  movement: string; // Purchase, Usage · M02, Opening stock, Adjustment
  qty: string;
  time: string;
}

@Injectable()
export class InventoryService {
  private stock: StockItem[] = [
    { name: 'CMYK Ink', type: 'ink', qty: 42, unit: 'Litres', cost: 850, min: 15 },
    { name: 'White Ink', type: 'ink', qty: 8, unit: 'Litres', cost: 920, min: 10 },
    { name: 'Violet Ink', type: 'ink', qty: 16, unit: 'Litres', cost: 1100, min: 6 },
    { name: 'Flex 3 ft', type: 'roll', qty: 12, unit: 'Rolls', cost: 650, min: 4, rollWidth: 3 },
    { name: 'Flex 4 ft', type: 'roll', qty: 9, unit: 'Rolls', cost: 780, min: 4, rollWidth: 4 },
    { name: 'Flex 5 ft', type: 'roll', qty: 6, unit: 'Rolls', cost: 950, min: 3, rollWidth: 5 },
    { name: 'Flex 6 ft', type: 'roll', qty: 5, unit: 'Rolls', cost: 1150, min: 3, rollWidth: 6 },
    { name: 'Flex 8 ft', type: 'roll', qty: 4, unit: 'Rolls', cost: 1450, min: 2, rollWidth: 8 },
    { name: 'Flex 10 ft', type: 'roll', qty: 2, unit: 'Rolls', cost: 1750, min: 2, rollWidth: 10 },
  ];

  private ledger: StockMovement[] = [
    { material: 'CMYK Ink', movement: 'Purchase', qty: '+20 L', time: 'Today, 09:15' },
    { material: 'Flex 4 ft', movement: 'Usage · M02', qty: '−2 rolls', time: 'Today, 08:52' },
    { material: 'White Ink', movement: 'Usage · M06', qty: '−1.5 L', time: 'Today, 08:30' },
    { material: 'Flex 8 ft', movement: 'Purchase', qty: '+3 rolls', time: 'Yesterday' },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getStock(search?: string, type?: string) {
    let list = [...this.stock];
    if (search) {
      list = list.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (type) {
      list = list.filter((s) => s.type === type);
    }

    return list.map((s) => ({
      ...s,
      stockValue: s.qty * s.cost,
      status: s.qty <= s.min ? 'Low stock' : 'In stock',
    }));
  }

  async getLedger(): Promise<StockMovement[]> {
    return this.ledger;
  }

  async recordMovement(dto: {
    material: string;
    type: 'ink' | 'roll';
    qty: number;
    unit: string;
    cost?: number;
    movement: 'Purchase' | 'Opening stock' | 'Adjustment' | 'Usage';
    rollWidth?: number;
  }) {
    let item = this.stock.find((s) => s.name.toLowerCase() === dto.material.toLowerCase());
    if (item) {
      if (dto.movement === 'Usage') {
        item.qty = Math.max(0, item.qty - dto.qty);
      } else {
        item.qty += dto.qty;
      }
      if (dto.cost) {
        item.cost = dto.cost;
      }
    } else {
      item = {
        name: dto.material,
        type: dto.type,
        qty: dto.qty,
        unit: dto.unit,
        cost: dto.cost || 850,
        min: dto.type === 'ink' ? 10 : 2,
        rollWidth: dto.rollWidth,
      };
      this.stock.push(item);
    }

    const sign = dto.movement === 'Usage' ? '−' : '+';
    this.ledger.unshift({
      material: item.name,
      movement: dto.movement,
      qty: `${sign}${dto.qty} ${dto.unit}`,
      time: 'Just now',
    });

    if (this.prisma.isConnectedToDb) {
      try {
        let movType: any = 'PURCHASE';
        if (dto.movement === 'Usage') movType = 'USAGE';
        else if (dto.movement === 'Opening stock') movType = 'OPENING_STOCK';
        else if (dto.movement === 'Adjustment') movType = 'ADJUSTMENT';

        await this.prisma.inventoryTransaction.create({
          data: {
            itemName: item.name,
            category: item.type,
            movementType: movType,
            quantity: dto.qty,
            unit: dto.unit,
            unitCost: item.cost,
            notes: `Recorded via portal (${sign}${dto.qty} ${dto.unit})`,
          },
        });

        if (item.type === 'ink') {
          await this.prisma.inkProduct.upsert({
            where: { name: item.name },
            create: {
              name: item.name,
              type: 'ink',
              currentStock: item.qty,
              costPerLitre: item.cost,
            },
            update: {
              currentStock: item.qty,
              costPerLitre: item.cost,
            },
          });
        } else {
          await this.prisma.material.upsert({
            where: { name: item.name },
            create: {
              name: item.name,
              category: 'roll',
              rollWidthFt: dto.rollWidth || item.rollWidth || 4,
              currentStock: item.qty,
              costPerRoll: item.cost,
              unit: item.unit,
            },
            update: {
              currentStock: item.qty,
              costPerRoll: item.cost,
            },
          });
        }
      } catch (err) {}
    }

    return {
      success: true,
      item,
      message: `Stock entry recorded: ${item.name} (${sign}${dto.qty} ${dto.unit})`,
    };
  }

}
