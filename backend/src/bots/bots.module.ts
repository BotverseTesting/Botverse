import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { GithubModule } from './github/github.module';
import { DiscordModule } from './discord/discord.module';
import { TeamsModule } from './teams/teams.module';
import { SlackModule } from './slack/slack.module';

@Module({
  controllers: [BotsController],
  providers: [BotsService, PrismaService],
  imports: [HttpModule, GithubModule, SlackModule, TeamsModule, DiscordModule],
})
export class BotsModule {}
