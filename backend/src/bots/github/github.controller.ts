import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubBotResponse } from 'src/dto/githubBotResponse';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get()
  async getGithubBots(): Promise<GithubBotResponse[]> {
    try {
      return await this.githubService.fetchGithubBots();
    } catch (error) {
      throw new HttpException(
        `Error fetching marketplace listings: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('/save')
  async saveGithubBots(): Promise<{ message: string }> {
    try {
      const bots = await this.githubService.fetchGithubBots();
      await this.githubService.saveGithubBots(bots);
      return { message: 'Bots saved successfully' };
    } catch (error) {
      throw new HttpException(
        `Error saving GitHub bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
