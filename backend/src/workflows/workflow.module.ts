import { Module, forwardRef } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowResolver } from './workflow.resolver';
import { PrismaModule } from '../prisma/prisma.module'; // Ruta correcta

@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [WorkflowService, WorkflowResolver],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
