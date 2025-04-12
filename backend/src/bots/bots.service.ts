import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
}
