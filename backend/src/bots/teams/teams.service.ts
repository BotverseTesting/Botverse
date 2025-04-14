import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { TeamsBotResponse } from 'src/dto/teamsBotResponse';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async scrapeTeamsData(limit: number = 100): Promise<TeamsBotResponse[]> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let allBots: TeamsBotResponse[] = [];
    let pageNumber = 1;

    try {
      while (allBots.length < limit) {
        await page.goto(
          `https://appsource.microsoft.com/es-es/marketplace/apps?search=bot&page=${pageNumber}&product=teams`,
          { waitUntil: 'networkidle2', timeout: 60000 },
        );

        await page.waitForSelector('.tileContainer', { timeout: 10000 });

        const bots = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.tileContainer')).map(
            (tile) => ({
              title: tile.getAttribute('title') || 'No title',
              link: tile.getAttribute('href') || '#',
              imgSrc: tile.querySelector('img')?.getAttribute('src') || null,
              description:
                tile
                  .querySelector(
                    '.multineEllipsis.description.mobileDescription',
                  )
                  ?.textContent?.trim() || null,
              rating:
                tile
                  .querySelector('.detailsRatingAvgNumOfStars')
                  ?.textContent?.trim() || null,
            }),
          );
        });

        allBots = [...allBots, ...bots.slice(0, limit - allBots.length)];

        for (const bot of bots) {
          await this.saveTeamsBotToDatabase(bot);
        }

        if (allBots.length >= limit) break;

        pageNumber++;
      }

      return allBots;
    } catch (error) {
      console.error('Scraping error:', error);
      throw new HttpException(
        `Error scraping Teams bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await browser.close();
    }
  }
  async saveTeamsBotToDatabase(bot: TeamsBotResponse): Promise<void> {
    try {
      const existingBot = await this.prisma.bot.findUnique({
        where: { name: bot.title },
      });

      if (!existingBot) {
        await this.prisma.bot.create({
          data: {
            name: bot.title,
            description: bot.description || 'No description',
            sourcePlatform: 'teams',
            officialWebsite: `https://appsource.microsoft.com${bot.link}`,
            categories: [],
            images: {
              create: [{ url: bot.imgSrc || '', type: 'logo' }],
            },
            features: {
              create: {
                title: 'General Features',
                description: bot.description || 'No description',
                capabilities: [],
              },
            },
          },
        });
        console.log(`Bot "${bot.title}" saved successfully.`);
      } else {
        console.log(`Bot "${bot.title}" already exists. Skipping creation.`);
      }
    } catch (error) {
      throw new HttpException(
        `Error saving Teams bot to database: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async scrapeBotDetailsTeams(botId: string): Promise<any> {
    const BASE_URL = 'https://appsource.microsoft.com/es-es/product/office';
    const url = `${BASE_URL}/${botId}?tab=Overview`;
    console.log(`Scraping URL: ${url}`);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      await page.waitForSelector('.tabContent', { timeout: 10000 });

      const productDetails = await page.evaluate(() => {
        const getText = (selector: string): string =>
          document.querySelector(selector)?.textContent?.trim() ||
          'No disponible';

        const title = getText('.titleBlock .title');
        const subtitle = getText('.titleBlock .subTitle');

        const priceElement = document.querySelector(
          '.pricingText .ms-fontSize-16',
        );
        const advertenciaElement = document.querySelector(
          '.pricingText .ms-TooltipHost, .pricingText [class*="advertencia"]',
        );

        const textoPrecio = priceElement?.textContent?.trim() || '';
        const esGratisBase = textoPrecio.includes('Gratis');
        const tieneAdvertencia =
          advertenciaElement?.textContent?.includes('compra adicional') ??
          false;

        const precio = esGratisBase && !tieneAdvertencia;

        const description = getText('.appDetailContent .description');

        const benefitsList = Array.from(
          document.querySelectorAll('.appDetailContent .description p'),
        ).map((item) => item.textContent?.trim() || '');

        const capabilitiesTitle = getText('.capabilities .capabilitiesTitle');

        const capabilitiesList = Array.from(
          document.querySelectorAll('.capabilitiesList li'),
        ).map((item) => item.textContent?.trim() || '');

        return {
          title,
          subtitle,
          precio,
          description,
          benefitsList,
          capabilitiesTitle,
          capabilitiesList,
        };
      });

      return productDetails;
    } catch (error) {
      console.error('Error en scraping:', error);
    } finally {
      await browser.close();
    }
  }
  async updateBotDetailsTeams(): Promise<void> {
    const teamsBots = await this.prisma.bot.findMany({
      where: { sourcePlatform: 'teams' },
    });
    for (const bot of teamsBots) {
      const match = bot.officialWebsite
        ? bot.officialWebsite.match(/\/([A-Za-z]+\d+)(?=\?)/)
        : null;
      const botId = match ? match[1] : null;
      if (botId) {
        const data = (await this.scrapeBotDetailsTeams(botId)) as {
          title: string;
          subtitle: string;
          precio: string;
          description: string;
          benefitsList: string[];
          capabilitiesTitle: string;
          capabilitiesList: string[];
        };
        await this.prisma.bot.update({
          where: { id: bot.id },
          data: {
            categories: data.capabilitiesList,
            pricingInfo: data.precio,
          },
        });
        console.log(`Bot "${bot.name}" updated successfully.`);
      }
    }
  }
}
