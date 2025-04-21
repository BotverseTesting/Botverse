import { Injectable, NotFoundException } from '@nestjs/common';
import { Workflow } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async createWorkflow(data: {
    name: string;
    description: string;
    useCase: string;
    isPublic?: boolean;
    tags?: string[];
    creatorId: number;
    botIds?: string[];
    configJson?: any;
  }): Promise<Workflow> {
    const {
      name,
      description,
      useCase,
      isPublic = false,
      tags = [],
      creatorId,
      botIds = [],
      configJson = {}, // 👈 añadido
    } = data;

    const userExists = await this.prisma.user.findUnique({
      where: { id: creatorId },
    });
    if (!userExists) {
      throw new NotFoundException(`User with ID ${creatorId} not found`);
    }

    if (botIds.length > 0) {
      const foundBots = await this.prisma.bot.findMany({
        where: { id: { in: botIds } },
      });

      if (foundBots.length !== botIds.length) {
        throw new NotFoundException('One or more bots were not found');
      }
    }

    return await this.prisma.workflow.create({
      data: {
        name,
        description,
        useCase,
        isPublic,
        tags,
        configJson,
        creator: {
          connect: { id: creatorId },
        },
        bots: {
          connect: botIds.map((id) => ({ id })),
        },
      },
    });
  }
}
