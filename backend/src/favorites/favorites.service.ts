import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Añade un bot a los favoritos de un usuario
   */
  async create(userId: number, botId: string) {
    const botExists = await this.prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!botExists) {
      throw new NotFoundException(`El bot con ID ${botId} no existe`);
    }

    try {
      return await this.prisma.favoriteBot.create({
        data: {
          userId,
          botId,
        },
        include: {
          bot: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Este bot ya está en tus favoritos');
      }
      throw error;
    }
  }

  /**
   * Elimina un bot de los favoritos de un usuario
   */
  async remove(userId: number, botId: string) {
    const favorite = await this.prisma.favoriteBot.findUnique({
      where: {
        userId_botId: {
          userId,
          botId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Este bot no está en tus favoritos');
    }

    return this.prisma.favoriteBot.delete({
      where: {
        userId_botId: {
          userId,
          botId,
        },
      },
    });
  }

  /**
   * Obtiene todos los bots favoritos de un usuario
   */
  async findAllByUser(userId: number) {
    return this.prisma.favoriteBot.findMany({
      where: { userId },
      include: {
        bot: {
          select: {
            id: true,
            name: true,
            description: true,
            sourcePlatform: true,
            officialWebsite: true,
          },
        },
      },
    });
  }

  /**
   * Verifica si un bot está en favoritos de un usuario
   */
  async isFavorite(userId: number, botId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteBot.findUnique({
      where: {
        userId_botId: {
          userId,
          botId,
        },
      },
    });

    return !!favorite;
  }
}
