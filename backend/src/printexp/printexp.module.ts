import { Module } from '@nestjs/common';
import { PrintExpService } from './printexp.service';
import { PrintExpController } from './printexp.controller';

@Module({
  controllers: [PrintExpController],
  providers: [PrintExpService],
  exports: [PrintExpService],
})
export class PrintExpModule {}
