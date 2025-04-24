import { Test, TestingModule } from '@nestjs/testing';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Platform } from '@prisma/client';
import { Prisma } from '@prisma/client';

describe('BotsController', () => {
  let botsController: BotsController;
  let botsService: BotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotsController],
      providers: [
        {
          provide: BotsService,
          useValue: {
            getAll: jest.fn(),
            deleteByCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    botsController = module.get<BotsController>(BotsController);
    botsService = module.get<BotsService>(BotsService);
  });

  describe('getBots', () => {
    it('should throw BAD_REQUEST if sourcePlatform is not provided', async () => {
      await expect(
        botsController.getBots(undefined as unknown as Platform),
      ).rejects.toThrow(
        new HttpException(
          'sourcePlatform query parameter is required',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should return bots if sourcePlatform is provided', async () => {
      const mockBots = [
        {
          id: 'uuid-1',
          name: 'Test Bot',
          description: 'Test description',
          sourcePlatform: Platform.discord,
          createdAt: new Date(),
        },
      ];

      jest.spyOn(botsService, 'getAll').mockResolvedValue(mockBots);

      const result = await botsController.getBots(Platform.discord);
      expect(result).toEqual({ bots: mockBots });
      expect(botsService.getAll).toHaveBeenCalledWith(Platform.discord);
    });

    it('should throw INTERNAL_SERVER_ERROR if service throws an error', async () => {
      jest
        .spyOn(botsService, 'getAll')
        .mockRejectedValue(new Error('Service error'));

      await expect(botsController.getBots(Platform.discord)).rejects.toThrow(
        new HttpException(
          'Error fetching bots: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('deleteBots', () => {
    it('should throw BAD_REQUEST if sourcePlatform is not provided', async () => {
      await expect(
        botsController.deleteBots(undefined as unknown as Platform),
      ).rejects.toThrow(
        new HttpException(
          'sourcePlatform query parameter is required',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
