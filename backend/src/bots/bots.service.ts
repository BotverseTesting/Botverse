import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import QueryUtil from 'src/utils/query';
import {
  GithubBotResponse,
  GithubAPIResponse,
} from 'src/dto/githubBotResponse';

@Injectable()
export class BotsService {
  private readonly GITHUB_API_URL = process.env.GITHUB_API_URL;
  private readonly TOKEN = process.env.GITHUB_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  async fetchGithubBots(): Promise<GithubBotResponse[]> {
    if (!this.GITHUB_API_URL) {
      throw new HttpException(
        'GITHUB_API_URL is not defined',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const response = await this.httpService.axiosRef.post<{
        data: { marketplaceListings: { nodes: GithubAPIResponse[] } };
      }>(
        this.GITHUB_API_URL,
        { query: QueryUtil.queryGithub },
        {
          headers: {
            Authorization: `Bearer ${this.TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Node.js',
          },
        },
      );

      const listings = response.data?.data?.marketplaceListings?.nodes ?? [];
      return listings.map((item) => new GithubBotResponse(item));
    } catch (error) {
      throw new HttpException(
        `Error fetching marketplace listings: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
