import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { SlackService } from './slack.service';
import { SlackBotResponse } from 'src/dto/slackBotResponse';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('slack')
  async getMarketplaceApps(): Promise<SlackBotResponse[]> {
    try {
      return await this.slackService.scrapeSlackMarketplace();
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
      const bots = await this.slackService.scrapeSlackMarketplace(limit);
      for (const bot of bots) {
        await this.slackService.saveSlackBotToDatabase(bot);
      }
      return bots;
    } catch (error) {
      throw new HttpException(
        `Error scraping Slack bots: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('scrape')
  async scrapeAppDetails(
    @Query('officialWebsite') officialWebsite: string,
  ): Promise<any> {
    if (!officialWebsite) {
      throw new HttpException(
        'officialWebsite query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = await this.slackService.scrapeAppDetails(officialWebsite);
      return data;
    } catch (error) {
      throw new HttpException(
        `Error scraping app details: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
