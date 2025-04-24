import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../../prisma/prisma.service';
import puppeteer from 'puppeteer';
import { Platform } from '@prisma/client';

jest.mock('puppeteer');

describe('TeamsService', () => {
  let service: TeamsService;
  let prismaService: PrismaService;

  const createMockBot = (id: string) => ({
    id,
    name: 'Bot 1',
    description: 'Description 1',
    sourcePlatform: Platform.teams,
    officialWebsite: 'https://example.com',
    documentationUrl: null,
    categories: [],
    pricingInfo: null,
    createdAt: new Date(),
    images: [],
    links: [],
    permissions: [],
    technicalDetails: null,
    features: [],
    workflows: [],
    favoritedBy: [],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService, PrismaService],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('scrapeTeamsData', () => {
    it('should return scraped bot data', async () => {
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn(),
          waitForSelector: jest.fn(),
          evaluate: jest.fn().mockResolvedValue([
            {
              title: 'Test Bot',
              link: '/test-bot',
              imgSrc: 'test.jpg',
              description: 'Test description',
              rating: '4.5',
            },
          ]),
        }),
        close: jest.fn(),
      };
      (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

      const result = await service.scrapeTeamsData(1);
      expect(result).toEqual([
        {
          title: 'Test Bot',
          link: '/test-bot',
          imgSrc: 'test.jpg',
          description: 'Test description',
          rating: '4.5',
        },
      ]);
    });
  });

  describe('saveTeamsBotToDatabase', () => {
    it('should create new bot if not exists', async () => {
      const mockBot = createMockBot('uuid-1');
      jest.spyOn(prismaService.bot, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.bot, 'create').mockResolvedValue(mockBot);

      await service.saveTeamsBotToDatabase({
        title: 'New Bot',
        description: 'New Description',
        link: '/new-bot',
        imgSrc: 'new.jpg',
        rating: '5.0',
      });

      expect(prismaService.bot.create).toHaveBeenCalledWith({
        data: {
          name: 'New Bot',
          description: 'New Description',
          sourcePlatform: Platform.teams,
          officialWebsite: 'https://appsource.microsoft.com/new-bot',
          categories: [],
          images: {
            create: [{ url: 'new.jpg', type: 'logo' }],
          },
          features: {
            create: {
              title: 'General Features',
              description: 'New Description',
              capabilities: [],
            },
          },
        },
      });
    });

    it('should skip creation if bot exists', async () => {
      jest
        .spyOn(prismaService.bot, 'findUnique')
        .mockResolvedValue(createMockBot('uuid-1'));
      const createSpy = jest.spyOn(prismaService.bot, 'create');

      await service.saveTeamsBotToDatabase({
        title: 'Existing Bot',
        description: 'Existing Description',
        link: '/existing-bot',
        imgSrc: 'existing.jpg',
        rating: '4.0',
      });

      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});
