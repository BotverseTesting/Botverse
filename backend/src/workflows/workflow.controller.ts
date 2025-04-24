import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';

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
  ) {
    return this.workflowService.createWorkflow(body);
  }

  @Get()
  async getAllWorkflows() {
    return await this.workflowService.getAllWorkflows();
  }

  @Get(':id')
  async getWorkflowById(@Param('id') id: string) {
    return await this.workflowService.getWorkflowById(id);
  }
}
