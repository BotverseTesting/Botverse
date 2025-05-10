import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class BotsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(sourcePlatform: string): Promise<any[]> {
    try {
      const bots = await this.prisma.bot.findMany({
        where: {
          sourcePlatform: sourcePlatform as Platform,
        },
      });

      return bots;
    } catch (error) {
      throw new HttpException(
        `Error fetching bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async deleteByCategory(sourcePlatform: string) {
    try {
      // Primero obtenemos los IDs de los bots a eliminar
      const botsToDelete = await this.prisma.bot.findMany({
        where: {
          sourcePlatform: sourcePlatform as Platform,
        },
        select: {
          id: true,
        },
      });
      const botIds = botsToDelete.map((bot) => bot.id);

      // Usamos una transacción para asegurar la atomicidad
      return await this.prisma.$transaction([
        // 1. Eliminar imágenes relacionadas
        this.prisma.botImage.deleteMany({
          where: {
            botId: { in: botIds },
          },
        }),

        // 2. Eliminar enlaces relacionados
        this.prisma.botLink.deleteMany({
          where: {
            botId: { in: botIds },
          },
        }),

        // 3. Eliminar permisos relacionados
        this.prisma.botPermission.deleteMany({
          where: {
            botId: { in: botIds },
          },
        }),

        // 4. Eliminar detalles técnicos relacionados
        this.prisma.technicalDetails.deleteMany({
          where: {
            botId: { in: botIds },
          },
        }),

        // 5. Eliminar características relacionadas
        this.prisma.feature.deleteMany({
          where: {
            botId: { in: botIds },
          },
        }),

        // 6. Finalmente eliminar los bots
        this.prisma.bot.deleteMany({
          where: {
            id: { in: botIds },
          },
        }),
      ]);
    } catch (error) {
      throw new HttpException(
        `Error deleting bots: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
