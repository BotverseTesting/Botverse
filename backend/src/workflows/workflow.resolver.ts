// workflow.resolver.ts
import { Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { Workflow } from 'src/@generated/prisma-graphql/workflow/workflow.model';

@Resolver('Workflow')
export class WorkflowResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Workflow])
  async workflows() {
    return this.prisma.workflow.findMany({
      include: {
        bots: true,
        creator: true,
      },
    });
  }
}
