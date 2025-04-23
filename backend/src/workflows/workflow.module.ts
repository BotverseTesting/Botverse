import { Module, forwardRef } from '@nestjs/common';

import { WorkflowResolver } from './workflow.resolver';
import { PrismaModule } from '../prisma/prisma.module'; // Ruta correcta
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [WorkflowService, WorkflowResolver],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
