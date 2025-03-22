import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsBotResponse } from 'src/dto/teamsBotResponse';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('')
  async scrapeTeamsBots(
    @Body('limit') limit: number = 100,
  ): Promise<TeamsBotResponse[]> {
    try {
      const bots: TeamsBotResponse[] =
        await this.teamsService.scrapeTeamsData(limit);
      return bots;
    } catch (error) {
      console.error('Error scraping data:', error);
      throw new HttpException(
        `Error scraping Teams bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('/:id')
  async getBotDetails(@Param('id') botId: string): Promise<any> {
    return await this.teamsService.scrapeBotDetailsTeams(botId);
  }
}
