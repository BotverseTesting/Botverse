import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { JsonValue } from '@prisma/client/runtime/library';

describe('WorkflowController', () => {
  let controller: WorkflowController;
  let service: WorkflowService;

  // Mock data completo
  const mockWorkflow = {
    id: '1',
    name: 'Test Workflow',
    description: 'Test Description',
    useCase: 'Test Use Case',
    configJson: { key: 'value' } as JsonValue,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: true,
    tags: ['test'],
    creatorId: 1,
    bots: [{ id: 'bot1', name: 'Test Bot' }],
    creator: { id: 1, name: 'Test User' },
  };

  const mockWorkflowShort = {
    id: '1',
    name: 'Workflow 1',
    description: 'Description',
    useCase: 'Use Case',
    configJson: {} as JsonValue,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    tags: [],
    creatorId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowService,
          useValue: {
            createWorkflow: jest.fn().mockResolvedValue(mockWorkflow),
            getAllWorkflows: jest.fn().mockResolvedValue([mockWorkflowShort]),
            getWorkflowById: jest.fn().mockResolvedValue(mockWorkflow),
          },
        },
      ],
    }).compile();

    controller = module.get<WorkflowController>(WorkflowController);
    service = module.get<WorkflowService>(WorkflowService);
  });

  describe('createWorkflow', () => {
    it('should create a workflow', async () => {
      const body = {
        name: 'Test Workflow',
        description: 'Test Description',
        useCase: 'Test Use Case',
        isPublic: true,
        tags: ['test'],
        creatorId: 1,
        botIds: ['bot1'],
        configJson: { key: 'value' },
      };

      const result = await controller.createWorkflow(body);
      expect(result).toEqual(mockWorkflow);
      expect(service.createWorkflow).toHaveBeenCalledWith(body);
    });
  });

  describe('getAllWorkflows', () => {
    it('should return all workflows', async () => {
      const result = await controller.getAllWorkflows();
      expect(result).toEqual([mockWorkflowShort]);
      expect(service.getAllWorkflows).toHaveBeenCalled();
    });
  });

  describe('getWorkflowById', () => {
    it('should return a workflow by ID', async () => {
      const result = await controller.getWorkflowById('1');
      expect(result).toEqual(mockWorkflow);
      expect(service.getWorkflowById).toHaveBeenCalledWith('1');
    });
  });
});
