import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import QueryUtil from 'src/utils/query';
import {
  GithubBotResponse,
  GithubAPIResponse,
} from 'src/dto/githubBotResponse';
import { DiscordBotResponse } from 'src/dto/discordBotResponse';
import * as puppeteer from 'puppeteer';
import { TeamsBotResponse } from 'src/dto/teamsBotResponse';
import { PrismaService } from 'src/prisma/prisma.service';
import { SlackBotResponse } from 'src/dto/slackBotResponse';

@Injectable()
export class BotsService {
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
        // Verificar si el bot ya existe en la base de datos por nombre y plataforma
        const existingBot = await this.prisma.bot.findFirst({
          where: {
            name: bot.name,
            sourcePlatform: 'github', // Verificar la plataforma
          },
        });

        // Si el bot no existe, crearlo
        if (!existingBot) {
          await this.prisma.bot.create({
            data: {
              name: bot.name,
              description: bot.fullDescription,
              sourcePlatform: 'github', // Asignar la plataforma como 'github'
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
  async scrapeDiscordBots(
    searchQuery: string,
    limit: number = 100,
  ): Promise<any> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let allBots: DiscordBotResponse[] = [];
    let pageNumber = 1;

    try {
      while (allBots.length < limit) {
        await page.goto(
          `https://discord.com/discovery/applications/search?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}`,
          { waitUntil: 'networkidle2', timeout: 60000 },
        );

        await page.waitForSelector('[class*="avatarContainer"] img', {
          visible: true,
          timeout: 15000,
        });
        await page.waitForSelector('[class*="bannerImage"]', {
          visible: true,
          timeout: 15000,
        });

        console.log('Haciendo scroll automático...');
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if (totalHeight >= scrollHeight) {
                clearInterval(timer);
                resolve();
              }
            }, 100);
          });
        });

        const bots = await page.evaluate(() => {
          const cards = Array.from(
            document.querySelectorAll('[class*="container"]'),
          );
          return cards.map((card) => ({
            name:
              card.querySelector('[class*="appName"]')?.textContent?.trim() ||
              'No name',
            logo:
              card
                .querySelector('[class*="avatarContainer"] img')
                ?.getAttribute('src') || null,
            banner:
              card
                .querySelector('[class*="bannerImage"]')
                ?.getAttribute('src') || null,
            category:
              card
                .querySelector('[class*="appCategory"]')
                ?.textContent?.trim() || 'No category',
            description:
              (card
                .querySelector('[class*="description"]')
                ?.textContent?.trim()
                ?.slice(0, 100) || 'No description') + '...',
          }));
        });

        const filteredBots = bots
          .filter((b) => b.name !== 'No name')
          .map(
            (bot) =>
              new DiscordBotResponse({
                ...bot,
                logo: bot.logo ?? '',
                image: bot.banner ?? '',
              }),
          );

        allBots = [
          ...allBots,
          ...filteredBots.slice(0, limit - allBots.length),
        ];

        if (allBots.length >= limit) break;

        pageNumber++;
      }

      // Guardar los bots en la base de datos
      await this.saveDiscordBotsToDatabase(allBots);
      return allBots;
    } catch (error) {
      throw new HttpException(
        `Error scraping Discord bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await browser.close();
    }
  }

  async saveDiscordBotsToDatabase(bots: DiscordBotResponse[]): Promise<void> {
    try {
      for (const bot of bots) {
        // Verificar si el bot ya existe en la base de datos
        const existingBot = await this.prisma.bot.findUnique({
          where: { name: bot.name },
        });

        if (!existingBot) {
          // Crear el bot en la base de datos
          await this.prisma.bot.create({
            data: {
              name: bot.name,
              description: bot.description,
              sourcePlatform: 'discord',
              categories: [bot.category],
              images: {
                create: [
                  { url: bot.logo, type: 'logo' },
                  { url: bot.image, type: 'banner' },
                ],
              },
              features: {
                create: {
                  title: 'General Features',
                  description: bot.description,
                  capabilities: [],
                },
              },
            },
          });
        } else {
          console.log(`Bot "${bot.name}" already exists. Skipping creation.`);
        }
      }
    } catch (error) {
      throw new HttpException(
        `Error saving Discord bots to database: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async scrapeTeamsData(): Promise<TeamsBotResponse[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(
        'https://appsource.microsoft.com/es-es/marketplace/apps?search=bot&page=1&product=teams',
      );
      await page.waitForSelector('.tileContainer', { timeout: 10000 });

      return await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.tileContainer')).map(
          (tile) => ({
            title: tile.getAttribute('title') || 'No title',
            link: tile.getAttribute('href') || '#',
            imgSrc: tile.querySelector('img')?.getAttribute('src') || null,
            description:
              tile
                .querySelector('.multineEllipsis.description.mobileDescription')
                ?.textContent?.trim() || null,
            rating:
              tile
                .querySelector('.detailsRatingAvgNumOfStars')
                ?.textContent?.trim() || null,
          }),
        );
      });
    } finally {
      await browser.close();
    }
  }
  async scrapeSlackMarketplace(): Promise<SlackBotResponse[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(
        'https://newworkspace-sca7607.slack.com/marketplace/category/At0EFRCDNY-developer-tools',
      );
      await page.waitForSelector('li.app_row.interactive', { timeout: 10000 });

      return await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll('li.app_row.interactive'),
        ).map((tile) => ({
          id: tile.getAttribute('data-app-id') || 'No ID',
          nombre:
            tile.querySelector('span.media_list_title')?.textContent?.trim() ||
            'No title',
          descripcion:
            tile
              .querySelector('span.media_list_subtitle')
              ?.textContent?.trim() || 'No description',
          enlace:
            tile.querySelector('a.media_list_inner')?.getAttribute('href') ||
            '#',
          imagen:
            tile.querySelector('img.icon_28')?.getAttribute('src') || null,
          categoria:
            tile.querySelector('div.app_category_tag')?.textContent?.trim() ||
            'Sin categoría',
          precio:
            tile.querySelector('div.app_category_price')?.textContent?.trim() ||
            'Gratis',
        }));
      });
    } finally {
      await browser.close();
    }
  }
}
