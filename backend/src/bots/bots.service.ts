import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import QueryUtil from 'src/utils/query';
import {
  GithubBotResponse,
  GithubAPIResponse,
} from 'src/dto/githubBotResponse';
import { DiscordBotResponse } from 'src/dto/discordBotResponse';
import * as puppeteer from 'puppeteer';

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
  async scrapeDiscordBots(searchQuery: string): Promise<DiscordBotResponse[]> {
    const browser = await puppeteer.launch({
      headless: false, // Modo visible para depuración
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const page = await browser.newPage();

    // Configuración avanzada de stealth
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    );
    await page.setViewport({ width: 1366, height: 768 });
    await page.setJavaScriptEnabled(true);

    let allBots: DiscordBotResponse[] = [];
    let pageNumber = 1;

    try {
      while (pageNumber <= 1) {
        // Limitar páginas para pruebas
        await page.goto(
          `https://discord.com/discovery/applications/search?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}`,
          {
            waitUntil: 'networkidle2',
            timeout: 60000,
          },
        );

        await page.waitForSelector('[class*="avatarContainer"] img', {
          visible: true,
          timeout: 15000,
        });
        await page.waitForSelector('[class*="bannerImage"]', {
          visible: true,
          timeout: 15000,
        });

        const bots = await page.evaluate(() => {
          const cards = Array.from(
            document.querySelectorAll('[class*="container"]'),
          );

          const getAttribute = (el: Element | null): string | null => {
            if (!el) return null;
            const src =
              el.getAttribute('src') ||
              el.getAttribute('data-src') ||
              (el as HTMLElement).style.backgroundImage.match(
                /url\(["']?(.*?)["']?\)/,
              )?.[1];
            return src ?? null;
          };

          return cards.map((card) => ({
            name:
              card.querySelector('[class*="appName"]')?.textContent?.trim() ||
              'No name',
            logo: getAttribute(
              card.querySelector('[class*="avatarContainer"] img'),
            ), // Logo del bot
            banner: getAttribute(card.querySelector('[class*="bannerImage"]')), // Banner del bot
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

        allBots = [
          ...allBots,
          ...bots
            .filter((b) => b.name !== 'No name')
            .map(
              (bot) =>
                new DiscordBotResponse({
                  ...bot,
                  logo: bot.logo ?? '',
                  image: bot.banner ?? '',
                }),
            ),
        ];
        pageNumber++;
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      await browser.close();
    }

    return allBots;
  }
}
