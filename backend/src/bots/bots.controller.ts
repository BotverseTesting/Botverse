import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BotsService } from './bots.service';
import { GithubBotResponse } from 'src/dto/githubBotResponse';
import { TeamsBotResponse } from 'src/dto/teamsBotResponse';
import { SlackBotResponse } from 'src/dto/slackBotResponse';

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
  @Post('discord')
  async searchDiscordBots(
    @Body('query') query: string,
    @Body('limit') limit: number = 500,
  ): Promise<any> {
    try {
      return await this.botsService.scrapeDiscordBots(query, limit); // Pasar el límite al servicio
    } catch (error) {
      throw new HttpException(
        `Error scraping Discord bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('github/save')
  async saveGithubBots(): Promise<{ message: string }> {
    try {
      const bots = await this.botsService.fetchGithubBots(); // Obtiene los bots de GitHub
      await this.botsService.saveGithubBots(bots); // Guarda los bots en la base de datos
      return { message: 'Bots saved successfully' };
    } catch (error) {
      throw new HttpException(
        `Error saving GitHub bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('teams')
  async scrapeTeamsBots(
    @Body('limit') limit: number = 100, // Extraer el límite del body (valor por defecto: 100)
  ): Promise<TeamsBotResponse[]> {
    try {
      const bots: TeamsBotResponse[] =
        await this.botsService.scrapeTeamsData(limit);
      return bots;
    } catch (error) {
      console.error('Error scraping data:', error);
      throw new HttpException(
        `Error scraping Teams bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('slack')
  async getMarketplaceApps(): Promise<SlackBotResponse[]> {
    try {
      return await this.botsService.scrapeSlackMarketplace();
    } catch (error) {
      throw new HttpException(
        `Error scraping Slack marketplace: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('slack')
  async scrapeSlackBots(
    @Body('limit') limit: number = 100,
  ): Promise<SlackBotResponse[]> {
    try {
      const bots = await this.botsService.scrapeSlackMarketplace(limit);
      for (const bot of bots) {
        await this.botsService.saveSlackBotToDatabase(bot);
      }
      return bots;
    } catch (error) {
      throw new HttpException(
        `Error scraping Slack bots: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
