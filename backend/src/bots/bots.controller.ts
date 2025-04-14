import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { BotsService } from './bots.service';

@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}

  @Get()
  async getBots(@Query('sourcePlatform') sourcePlatform: string) {
    if (!sourcePlatform) {
      throw new HttpException(
        'sourcePlatform query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const bots = await this.botsService.getAll(sourcePlatform);
      return { bots };
    } catch (error) {
      throw new HttpException(
        `Error fetching bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete()
  async deleteBots(@Query('sourcePlatform') sourcePlatform: string) {
    if (!sourcePlatform) {
      throw new HttpException(
        'sourcePlatform query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const bots = await this.botsService.deleteByCategory(sourcePlatform);
      return { bots };
    } catch (error) {
      throw new HttpException(
        `Error fetching bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
