import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory Management')
@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  @ApiOperation({ summary: 'Get primary inventory table with stock value and reorder status' })
  async getStock(@Query('search') search?: string, @Query('type') type?: string) {
    const data = await this.inventoryService.getStock(search, type);
    return { success: true, data };
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Get stock movements ledger (purchases, opening stock, adjustments)' })
  async getLedger() {
    const data = await this.inventoryService.getLedger();
    return { success: true, data };
  }

  @Post('movement')
  @ApiOperation({ summary: 'Record stock purchase, opening stock, or adjustment' })
  async recordMovement(
    @Body()
    body: {
      material: string;
      type: 'ink' | 'roll';
      qty: number;
      unit: string;
      cost?: number;
      movement: 'Purchase' | 'Opening stock' | 'Adjustment' | 'Usage';
      rollWidth?: number;
    },
  ) {
    const res = await this.inventoryService.recordMovement(body);
    return res;
  }
}
