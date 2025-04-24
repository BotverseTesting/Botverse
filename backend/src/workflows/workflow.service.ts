import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Workflow } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
    configJson?: Prisma.JsonValue; // Tipo específico de Prisma para JSON
  }): Promise<Workflow & { bots: any[]; creator: any }> {
    const {
      name,
      description,
      useCase,
      isPublic = false,
      tags = [],
      creatorId,
      botIds = [],
      configJson = {}, // Valor por defecto como objeto vacío
    } = data;

    // Validar que configJson sea un objeto válido
    if (configJson && typeof configJson !== 'object') {
      throw new Error('configJson debe ser un objeto válido');
    }

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
        configJson: configJson as Prisma.JsonObject, // Conversión explícita
        creator: {
          connect: { id: creatorId },
        },
        bots: {
          connect: botIds.map((id) => ({ id })),
        },
      },
      include: {
        bots: true,
        creator: true,
      },
    });
  }

  async getAllWorkflows(): Promise<
    {
      id: string;
      name: string;
      description: string;
      useCase: string;
      configJson?: Prisma.JsonValue;
      createdAt: Date;
      updatedAt: Date;
      isPublic: boolean;
      tags: string[];
      creatorId: number;
      bots: { id: string; images: { url: string }[] }[];
      creator: { id: number; name: string };
    }[]
  > {
    return this.prisma.workflow.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        useCase: true,
        configJson: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        tags: true,
        creatorId: true,
        bots: {
          select: {
            id: true,
            images: {
              select: {
                url: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getWorkflowById(id: string): Promise<
    Workflow & {
      bots: { id: string; images: { url: string }[] }[];
      creator: { id: number; name: string };
      configJson?: Prisma.JsonValue;
    }
  > {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        bots: {
          select: {
            id: true,
            images: {
              select: {
                url: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }
}
