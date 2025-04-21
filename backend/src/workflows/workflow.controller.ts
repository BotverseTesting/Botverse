import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { Workflow } from '@prisma/client';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkflow(
    @Body()
    body: {
      name: string;
      description: string;
      useCase: string;
      isPublic?: boolean;
      tags?: string[];
      creatorId: number;
      botIds?: string[];
      configJson?: any;
    },
  ): Promise<Workflow> {
    return this.workflowService.createWorkflow(body);
  }
}
