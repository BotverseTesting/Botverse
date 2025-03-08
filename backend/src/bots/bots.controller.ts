import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { GithubBotResponse } from 'src/dto/githubBotResponse';
import { TeamsBotResponse } from 'src/dto/teamsBotResponse';

@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get('github')
  async getGithubBots(): Promise<GithubBotResponse[]> {
    try {
      return await this.botsService.fetchGithubBots();
    } catch (error) {
      throw new HttpException(
        `Error fetching marketplace listings: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('discord')
  async searchBots(@Query('q') query: string): Promise<any> {
    try {
      return await this.botsService.scrapeDiscordBots(query);
    } catch (error) {
      throw new HttpException(
        `Error scraping Discord bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('teams')
  async scrapeTeamsBots(): Promise<TeamsBotResponse[]> {
    try {
      console.log('Scraping data...');
      const bots: TeamsBotResponse[] = await this.botsService.scrapeTeamsData();
      console.log('Data scraped successfully:', bots);
      return bots;
    } catch (error) {
      console.error('Error scraping data:', error);
      throw new HttpException(
        `Error scraping Teams bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
