import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  GithubBotResponse,
  GithubAPIResponse,
} from 'src/dto/githubBotResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import QueryUtil from 'src/utils/query';

@Injectable()
export class GithubService {
  private readonly GITHUB_API_URL = process.env.GITHUB_API_URL;
  private readonly TOKEN = process.env.GITHUB_TOKEN;

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}
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

  async saveGithubBots(bots: GithubBotResponse[]): Promise<void> {
    try {
      for (const bot of bots) {
        const existingBot = await this.prisma.bot.findFirst({
          where: {
            name: bot.name,
            sourcePlatform: 'github',
          },
        });
        if (!existingBot) {
          await this.prisma.bot.create({
            data: {
              name: bot.name,
              description: bot.fullDescription,
              sourcePlatform: 'github',
              officialWebsite: bot.resourcePath,
              documentationUrl: bot.documentationUrl || null,
              categories: [bot.primaryCategoryName],
              pricingInfo: {
                isPaid: bot.isPaid,
                pricingUrl: bot.pricingUrl || null,
              },
              images: {
                create: {
                  url: bot.logoUrl,
                  type: 'logo',
                },
              },
              technicalDetails: {
                create: {
                  resourcePath: bot.resourcePath,
                  installationUrl: bot.installationUrl || null,
                  isVerified: bot.isVerified,
                  metadata: {
                    isPublic: bot.isPublic,
                  },
                },
              },
              features: {
                create: {
                  title: 'General Features',
                  description: bot.fullDescription,
                  capabilities: [],
                },
              },
            },
          });
        }
      }
    } catch (error) {
      throw new HttpException(
        `Error saving GitHub bots to database: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
