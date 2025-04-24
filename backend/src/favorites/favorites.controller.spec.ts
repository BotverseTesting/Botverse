import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  let service: FavoritesService;

  // Datos de prueba tipados correctamente
  const mockFavorite = {
    id: 1,
    userId: 1,
    botId: 'bot123',
    createdAt: new Date(),
    bot: {
      id: 'bot123',
      name: 'Test Bot',
      description: 'Test Description',
      sourcePlatform: 'DISCORD',
      officialWebsite: 'https://test.com',
    },
  };

  const mockFavoriteWithoutBot = {
    id: 1,
    userId: 1,
    botId: 'bot123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockFavorite),
            remove: jest.fn().mockResolvedValue(mockFavoriteWithoutBot),
            findAllByUser: jest.fn().mockResolvedValue([mockFavorite]),
            isFavorite: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    service = module.get<FavoritesService>(FavoritesService);
  });

  describe('create', () => {
    it('should call service with correct parameters', async () => {
      const result = await controller.create(1, 'bot123');
      expect(result).toEqual(mockFavorite);
      expect(service.create).toHaveBeenCalledWith(1, 'bot123');
    });
  });

  describe('remove', () => {
    it('should call service with correct parameters', async () => {
      const result = await controller.remove(1, 'bot123');
      expect(result).toEqual(mockFavoriteWithoutBot);
      expect(service.remove).toHaveBeenCalledWith(1, 'bot123');
    });
  });

  describe('findAllByUser', () => {
    it('should return favorites with bot data', async () => {
      const result = await controller.findAllByUser(1);
      expect(result).toEqual([mockFavorite]);
      expect(service.findAllByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('isFavorite', () => {
    it('should return favorite status', async () => {
      const result = await controller.isFavorite(1, 'bot123');
      expect(result).toBe(true);
      expect(service.isFavorite).toHaveBeenCalledWith(1, 'bot123');
    });
  });
});
