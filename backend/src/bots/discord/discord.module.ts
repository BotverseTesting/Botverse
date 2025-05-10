import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DiscordController],
  providers: [DiscordService, PrismaService],
})
export class DiscordModule {}
