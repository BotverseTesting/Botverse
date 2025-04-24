import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: PrismaService,
          useValue: {
            bot: { findUnique: jest.fn() },
            favoriteBot: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should add a bot to favorites', async () => {
      prisma.bot.findUnique = jest.fn().mockResolvedValue({ id: 'bot1' });
      prisma.favoriteBot.create = jest.fn().mockResolvedValue({
        userId: 1,
        botId: 'bot1',
        bot: { id: 'bot1', name: 'Test Bot', description: 'Test Description' },
      });

      const result = await service.create(1, 'bot1');
      expect(result).toEqual({
        userId: 1,
        botId: 'bot1',
        bot: { id: 'bot1', name: 'Test Bot', description: 'Test Description' },
      });
    });

    it('should throw NotFoundException if bot does not exist', async () => {
      prisma.bot.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.create(1, 'bot1')).rejects.toThrow(
        new NotFoundException('El bot con ID bot1 no existe'),
      );
    });

    it('should throw ConflictException if bot is already in favorites', async () => {
      prisma.bot.findUnique = jest.fn().mockResolvedValue({ id: 'bot1' });
      prisma.favoriteBot.create = jest
        .fn()
        .mockRejectedValue({ code: 'P2002' });

      await expect(service.create(1, 'bot1')).rejects.toThrow(
        new ConflictException('Este bot ya está en tus favoritos'),
      );
    });
  });

  describe('remove', () => {
    it('should remove a bot from favorites', async () => {
      prisma.favoriteBot.findUnique = jest
        .fn()
        .mockResolvedValue({ userId: 1, botId: 'bot1' });
      prisma.favoriteBot.delete = jest
        .fn()
        .mockResolvedValue({ userId: 1, botId: 'bot1' });

      const result = await service.remove(1, 'bot1');
      expect(result).toEqual({ userId: 1, botId: 'bot1' });
    });

    it('should throw NotFoundException if bot is not in favorites', async () => {
      prisma.favoriteBot.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.remove(1, 'bot1')).rejects.toThrow(
        new NotFoundException('Este bot no está en tus favoritos'),
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return all favorite bots for a user', async () => {
      prisma.favoriteBot.findMany = jest.fn().mockResolvedValue([
        {
          userId: 1,
          botId: 'bot1',
          bot: {
            id: 'bot1',
            name: 'Test Bot',
            description: 'Test Description',
            sourcePlatform: 'Test Platform',
            officialWebsite: 'https://test.com',
          },
        },
      ]);

      const result = await service.findAllByUser(1);
      expect(result).toEqual([
        {
          userId: 1,
          botId: 'bot1',
          bot: {
            id: 'bot1',
            name: 'Test Bot',
            description: 'Test Description',
            sourcePlatform: 'Test Platform',
            officialWebsite: 'https://test.com',
          },
        },
      ]);
    });
  });

  describe('isFavorite', () => {
    it('should return true if bot is in favorites', async () => {
      prisma.favoriteBot.findUnique = jest
        .fn()
        .mockResolvedValue({ userId: 1, botId: 'bot1' });

      const result = await service.isFavorite(1, 'bot1');
      expect(result).toBe(true);
    });

    it('should return false if bot is not in favorites', async () => {
      prisma.favoriteBot.findUnique = jest.fn().mockResolvedValue(null);

      const result = await service.isFavorite(1, 'bot1');
      expect(result).toBe(false);
    });
  });
});
