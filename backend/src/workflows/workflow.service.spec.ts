import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowService } from './workflow.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('WorkflowService', () => {
  let service: WorkflowService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowService, PrismaService],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createWorkflow', () => {
    it('should create a workflow successfully', async () => {
      const mockData = {
        name: 'Test Workflow',
        description: 'Test Description',
        useCase: 'Test Use Case',
        creatorId: 1,
        botIds: ['bot1', 'bot2'],
        configJson: { key: 'value' },
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.bot.findMany = jest
        .fn()
        .mockResolvedValue([{ id: 'bot1' }, { id: 'bot2' }]);
      prisma.workflow.create = jest.fn().mockResolvedValue({
        ...mockData,
        id: 'workflow1',
        bots: [{ id: 'bot1' }, { id: 'bot2' }],
        creator: { id: 1, name: 'Test User' },
      });

      const result = await service.createWorkflow(mockData);

      expect(result).toHaveProperty('id', 'workflow1');
      expect(result.bots).toHaveLength(2);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.bot.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['bot1', 'bot2'] } },
      });
      expect(prisma.workflow.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if creator does not exist', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.createWorkflow({
          name: 'Test Workflow',
          description: 'Test Description',
          useCase: 'Test Use Case',
          creatorId: 1,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if one or more bots are not found', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.bot.findMany = jest.fn().mockResolvedValue([{ id: 'bot1' }]);

      await expect(
        service.createWorkflow({
          name: 'Test Workflow',
          description: 'Test Description',
          useCase: 'Test Use Case',
          creatorId: 1,
          botIds: ['bot1', 'bot2'],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.bot.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['bot1', 'bot2'] } },
      });
    });
  });

  describe('getAllWorkflows', () => {
    it('should return all workflows', async () => {
      const mockWorkflows = [
        {
          id: 'workflow1',
          name: 'Workflow 1',
          description: 'Description 1',
          useCase: 'Use Case 1',
          isPublic: true,
          tags: ['tag1'],
          creatorId: 1,
          bots: [{ id: 'bot1', images: [{ url: 'image1.jpg' }] }],
          creator: { id: 1, name: 'User 1' },
        },
      ];

      prisma.workflow.findMany = jest.fn().mockResolvedValue(mockWorkflows);

      const result = await service.getAllWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(prisma.workflow.findMany).toHaveBeenCalled();
    });
  });

  describe('getWorkflowById', () => {
    it('should return a workflow by ID', async () => {
      const mockWorkflow = {
        id: 'workflow1',
        name: 'Workflow 1',
        description: 'Description 1',
        useCase: 'Use Case 1',
        isPublic: true,
        tags: ['tag1'],
        creatorId: 1,
        bots: [{ id: 'bot1', images: [{ url: 'image1.jpg' }] }],
        creator: { id: 1, name: 'User 1' },
      };

      prisma.workflow.findUnique = jest.fn().mockResolvedValue(mockWorkflow);

      const result = await service.getWorkflowById('workflow1');

      expect(result).toEqual(mockWorkflow);
      expect(prisma.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: 'workflow1' },
        include: {
          bots: { select: { id: true, images: { select: { url: true } } } },
          creator: { select: { id: true, name: true } },
        },
      });
    });

    it('should throw NotFoundException if workflow is not found', async () => {
      prisma.workflow.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.getWorkflowById('workflow1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: 'workflow1' },
        include: {
          bots: { select: { id: true, images: { select: { url: true } } } },
          creator: { select: { id: true, name: true } },
        },
      });
    });
  });
});
