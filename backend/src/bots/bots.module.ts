import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [BotsController],
  providers: [BotsService],
  imports: [HttpModule],
})
export class BotsModule {}
