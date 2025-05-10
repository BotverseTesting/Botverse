import { Test, TestingModule } from '@nestjs/testing';
import { BotsService } from './bots.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Platform } from '@prisma/client';

describe('BotsService', () => {
  let service: BotsService;
  let prisma: PrismaService;

  // Complete mock bot with all required fields
  const createMockBot = (id: string, name: string, platform: Platform) => ({
    id,
    name,
    description: 'Test description',
    sourcePlatform: platform,
    officialWebsite: null,
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

  // Minimal bot with just ID for deletion
  const createMinimalBotForDeletion = (id: string) => ({
    id,
    name: '', // Add required fields with dummy values
    description: '',
    sourcePlatform: Platform.discord,
    officialWebsite: null,
    documentationUrl: null,
    categories: [],
    pricingInfo: null,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotsService,
        {
          provide: PrismaService,
          useValue: {
            bot: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            botImage: { deleteMany: jest.fn() },
            botLink: { deleteMany: jest.fn() },
            botPermission: { deleteMany: jest.fn() },
            technicalDetails: { deleteMany: jest.fn() },
            feature: { deleteMany: jest.fn() },
            $transaction: jest
              .fn()
              .mockImplementation((ops) =>
                Promise.all(ops).then(() => 'Transaction successful'),
              ),
          },
        },
      ],
    }).compile();

    service = module.get<BotsService>(BotsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getAll', () => {
    it('should return a list of bots for a given platform', async () => {
      const mockBots = [
        createMockBot('uuid-1', 'Bot1', Platform.discord),
        createMockBot('uuid-2', 'Bot2', Platform.discord),
      ];

      jest.spyOn(prisma.bot, 'findMany').mockResolvedValue(mockBots);

      const result = await service.getAll(Platform.discord);
      expect(result).toEqual(mockBots);
      expect(prisma.bot.findMany).toHaveBeenCalledWith({
        where: { sourcePlatform: Platform.discord },
      });
    });

    it('should throw an HttpException if an error occurs', async () => {
      jest
        .spyOn(prisma.bot, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.getAll(Platform.discord)).rejects.toThrow(
        new HttpException(
          'Error fetching bots: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
