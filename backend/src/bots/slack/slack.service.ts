import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { SlackBotResponse } from 'src/dto/slackBotResponse';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SlackService {
  constructor(private readonly prisma: PrismaService) {}

  async scrapeSlackMarketplace(
    limit: number = 100,
  ): Promise<SlackBotResponse[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const bots: SlackBotResponse[] = [];
    let savedBots = 0;

    try {
      let currentPage = 1;

      while (savedBots < limit) {
        const url = `https://newworkspace-sca7607.slack.com/marketplace/category/At0EFRCDNY-developer-tools?page=${currentPage}`;
        console.log(`Navigating to page ${currentPage}: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        try {
          await page.waitForSelector('li.app_row.interactive', {
            timeout: 10000,
          });
        } catch {
          console.warn(`No bots found on page ${currentPage}. Stopping.`);
          break;
        }

        const pageBots = await page.evaluate(() => {
          return Array.from(
            document.querySelectorAll('li.app_row.interactive'),
          ).map((tile) => ({
            id: tile.getAttribute('data-app-id') || 'No ID',
            nombre:
              tile
                .querySelector('span.media_list_title')
                ?.textContent?.trim() || 'No title',
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
              tile
                .querySelector('div.app_category_price')
                ?.textContent?.trim() || 'Gratis',
          }));
        });

        bots.push(...pageBots);
        savedBots += pageBots.length;
        if (savedBots >= limit) {
          console.log(`Reached the limit of ${limit} bots. Stopping.`);
          break;
        }

        currentPage++;
      }
    } catch (error) {
      throw new HttpException(
        `Error scraping Slack marketplace: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await browser.close();
    }

    return bots.slice(0, limit);
  }
  async saveSlackBotToDatabase(bot: SlackBotResponse): Promise<void> {
    try {
      const existingBot = await this.prisma.bot.findUnique({
        where: { name: bot.nombre },
      });

      if (!existingBot) {
        await this.prisma.bot.create({
          data: {
            name: bot.nombre,
            description: bot.descripcion,
            sourcePlatform: 'slack',
            officialWebsite: bot.enlace,
            categories: [bot.categoria],
            pricingInfo: { price: bot.precio },
            images: {
              create: {
                url: bot.imagen || '',
                type: 'logo',
              },
            },
          },
        });
        console.log(`Bot "${bot.nombre}" saved successfully.`);
      } else {
        console.log(`Bot "${bot.nombre}" already exists. Skipping creation.`);
      }
    } catch (error) {
      throw new HttpException(
        `Error saving Slack bot to database: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async scrapeSlackDetails(officialWebsite: string): Promise<any> {
    const url = `https://slack.com${officialWebsite}`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('div.p-content', { timeout: 10000 });

    const data = await page.evaluate(() => {
      const getText = (selector: string): string =>
        document.querySelector(selector)?.textContent?.trim() || '';

      const nombre = getText('h2');
      const descripcion = getText('[data-qa="app_profile_desc"]');
      const precio = getText('.app_category_price');

      const imagenes = Array.from(
        document.querySelectorAll(
          '.p-app_directory_detail_carousel__image img',
        ),
      ).map((img) => (img as HTMLImageElement).src);

      const permisos = Array.from(
        document.querySelectorAll('#panel_settings .p-scope_info__group'),
      ).map((group) => ({
        categoria: group
          .querySelector('.p-scope_info__group_heading')
          ?.textContent?.trim(),
        detalles: Array.from(group.querySelectorAll('li')).map((li) =>
          li.textContent ? li.textContent.trim() : '',
        ),
      }));

      const seguridad: Record<string, string> = {};
      document
        .querySelectorAll('#panel_security_compliance .p-app_sec_comp__name')
        .forEach((el) => {
          const key = el.textContent?.trim().replace(':', '') || '';
          const value = el.nextElementSibling?.textContent?.trim() || '';
          seguridad[key] = value;
        });

      const additionalInfo = document.querySelector(
        '[data-automount-component="AppDirectoryAdditionalInfo"]',
      );
      let additionalData: Record<string, any> = {};
      if (additionalInfo) {
        try {
          const props = JSON.parse(
            additionalInfo
              .getAttribute('data-automount-props')
              ?.replace(/&quot;/g, '"') || '{}',
          ) as {
            supportedLanguages?: string[];
            categories?: { name: string }[];
            supportEmail?: string;
            privacyPolicyLink?: string;
          };
          additionalData = {
            idiomas: props.supportedLanguages || [],
            categorias: props.categories?.map((c) => c.name) || [],
            soporte: props.supportEmail,
            politica_privacidad: props.privacyPolicyLink,
          };
        } catch {
          throw new HttpException(
            `Error saving Slack bot `,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      const enlaces = Array.from(document.querySelectorAll('a')).map(
        (link) => ({
          text: link.textContent?.trim() || '',
          href: link.href,
        }),
      );

      const developerWebsiteLink = enlaces
        .filter((link) =>
          link.text.includes('Visitar el sitio web del desarrollador'),
        )
        .map((link) => link.href)[0];

      const supportLink = enlaces.filter((link) =>
        link.text.includes('Obtén ayuda de la aplicación'),
      );
      const categories: string[] | null = Array.isArray(
        additionalData['categorias'],
      )
        ? additionalData['categorias']
        : null;
      return {
        nombre,
        descripcion,
        precio,
        imagenes,
        permisos,
        seguridad,
        ...additionalData,
        developerWebsiteLink,
        supportLink,
        categories,
      };
    });

    await browser.close();
    return data;
  }

  async updateSlackBotDetails(): Promise<void> {
    const slackBots = await this.prisma.bot.findMany({
      where: { sourcePlatform: 'slack' },
    });
    const officialWebsites = slackBots.map((bot) => bot.officialWebsite);
    for (const officialWebsite of officialWebsites) {
      if (officialWebsite) {
        const data = (await this.scrapeSlackDetails(officialWebsite)) as {
          nombre: string;
          descripcion: string;
          precio: number;
          imagenes: string[];
          permisos: string[];
          seguridad: string[];
          additionalData?: Record<string, unknown>;
          developerWebsiteLink?: string;
          supportLink?: string;
          categories?: string[];
        };

        const bot = await this.prisma.bot.findUnique({
          where: { name: data.nombre },
        });
        if (bot) {
          await this.prisma.botImage.create({
            data: {
              url: data.imagenes[0] || '',
              type: 'banner',
              botId: bot.id,
            },
          });
          await this.prisma.bot.update({
            where: { id: bot.id },
            data: {
              categories: data.categories,
              documentationUrl: data.developerWebsiteLink,
            },
          });
          console.log('Updating ' + bot.name);
        }
      } else {
        console.warn('Official website URL is null, skipping.');
      }
    }
  }
}
