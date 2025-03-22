import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SlackController],
  providers: [SlackService, PrismaService],
})
export class SlackModule {}
