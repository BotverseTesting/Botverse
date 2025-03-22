import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [GithubController],
  providers: [GithubService, PrismaService],
  imports: [HttpModule],
})
export class GithubModule {}
