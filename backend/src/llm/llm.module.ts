import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ConfigModule], // Necesario para usar variables de entorno
  controllers: [LlmController],
  providers: [LlmService, PrismaService],
})
export class LlmModule {}
