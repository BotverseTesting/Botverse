import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { DiscordBotResponse } from 'src/dto/discordBotResponse';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscordService {
  constructor(private readonly prisma: PrismaService) {}
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
        const existingBot = await this.prisma.bot.findUnique({
          where: { name: bot.name },
        });

        if (!existingBot) {
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
  async scrapeBotDetails(botId) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    await page.goto(`https://discord.com/discovery/applications/${botId}`, {
      waitUntil: 'networkidle2',
    });

    await page.waitForSelector('.container__8a003', { timeout: 10000 });

    const botDetails = await page.evaluate(() => {
      const data: {
        enlaces: { texto: string; enlace: string }[];
        informacion?: { descripcion?: string };
      } = { enlaces: [] };

      data.enlaces = [];
      document.querySelectorAll('.linkItem__8a003').forEach((link) => {
        const text = link
          .querySelector('.listText__8a003')
          ?.textContent?.trim();
        const url = (link as HTMLAnchorElement).href;
        if (text && url) data.enlaces.push({ texto: text, enlace: url });
      });
      const infoSection = document.querySelector('.infoSection_de3a16');
      if (infoSection) {
        data.informacion = {
          descripcion: infoSection
            .querySelector('.text-sm\\/medium_cf4812')
            ?.textContent?.trim(),
        };
      }

      return data;
    });

    await browser.close();
    return botDetails;
  }
}
