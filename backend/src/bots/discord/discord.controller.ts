import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Post('save')
  async searchDiscordBots(
    @Body('query') query: string,
    @Body('limit') limit: number = 500,
  ): Promise<any> {
    try {
      return await this.discordService.scrapeDiscordBots(query, limit); // Pasar el límite al servicio
    } catch (error) {
      throw new HttpException(
        `Error scraping Discord bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('details')
  async getDiscordBots(): Promise<any> {
    try {
      return await this.discordService.updateBotDetails();
    } catch (error) {
      throw new HttpException(
        `Error getting Discord bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
