import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnectedToDb: boolean = false;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnectedToDb = true;
      this.logger.log('Successfully connected to PostgreSQL database via Prisma.');
    } catch (err: any) {
      this.isConnectedToDb = false;
      this.logger.warn(`PostgreSQL connection not available at ${process.env.DATABASE_URL || 'localhost:5432'}. Running with local high-availability state store.`);
    }
  }

  async onModuleDestroy() {
    if (this.isConnectedToDb) {
      await this.$disconnect();
    }
  }
}
