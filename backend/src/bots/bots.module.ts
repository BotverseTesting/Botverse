import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BotsController],
  providers: [BotsService, PrismaService],
  imports: [HttpModule],
})
export class BotsModule {}
