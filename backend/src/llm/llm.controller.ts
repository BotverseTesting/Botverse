import {
  Controller,
  Post,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('chat')
  async chatWithLlm(@Body() body: { messages: any[]; model?: string }) {
    return this.llmService.chat(body.messages, body.model);
  }
  @Post('describe-bots')
  async describeBots(@Query('sourcePlatform') sourcePlatform?: string) {
    if (sourcePlatform && typeof sourcePlatform !== 'string') {
      throw new BadRequestException(
        'sourcePlatform debe ser una string válida',
      );
    }

    return this.llmService.describeBots(sourcePlatform || '');
  }
  @Post('start')
  async startChatWithContext(@Body() body: { userId: number; title?: string }) {
    return this.llmService.startChatWithContext(body.userId, body.title);
  }
  @Post('continue')
  async continueChat(@Body() body: { sessionId: string; message: string }) {
    const { sessionId, message } = body;
    if (!sessionId || !message) {
      throw new BadRequestException('sessionId y message son obligatorios.');
    }

    return this.llmService.continueChatSession(sessionId, message);
  }
  @Post('recommend-workflow')
  async recommendWorkflow(@Body() body: { userId: number; goal: string }) {
    return this.llmService.recommendWorkflow(body.userId, body.goal);
  }
}
