import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Platform } from '@prisma/client';

@Injectable()
export class LlmService {
  private readonly OPENROUTER_URL =
    'https://openrouter.ai/api/v1/chat/completions';
  private readonly REFERER = 'http://localhost:3000';
  private readonly TITLE = 'My Nest App';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async chat(
    messages: any[],
    model: string = 'meta-llama/llama-4-maverick:free',
  ) {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error(
        'El campo "messages" es obligatorio y no puede estar vacío.',
      );
    }
    const payload = {
      model,
      messages,
    };

    const headers = {
      Authorization: `Bearer ${this.configService.get('OPENROUTER_API_KEY')}`,
      'HTTP-Referer': this.REFERER,
      'X-Title': this.TITLE,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(this.OPENROUTER_URL, payload, {
      headers,
    });
    return response.data;
  }
  async describeBots(sourcePlatform: string) {
    // Validar que sea una plataforma válida
    const validPlatforms = [
      'discord',
      'github',
      'slack',
      'teams',
      'microsoft_store',
    ];
    if (sourcePlatform && !validPlatforms.includes(sourcePlatform)) {
      throw new Error(
        `sourcePlatform debe ser uno de: ${validPlatforms.join(', ')}`,
      );
    }

    const bots = await this.prisma.bot.findMany({
      where: sourcePlatform
        ? { sourcePlatform: sourcePlatform as Platform }
        : {},
      select: {
        name: true,
        description: true,
        categories: true,
      },
    });

    if (bots.length === 0) {
      return { message: 'No bots found for the given platform.' };
    }

    const prompt = bots
      .map((bot) => {
        return `Bot: ${bot.name}\nDescripción: ${bot.description}\nCategorías: ${bot.categories.join(', ')}`;
      })
      .join('\n\n');

    const messages = [
      {
        role: 'system',
        content: 'Tienes una lista de bots para la plataforma indicada.',
      },
      {
        role: 'user',
        content:
          `Aquí están todos los bots disponibles en la plataforma "${sourcePlatform}". ` +
          `Dame un análisis general, clasifícalos por utilidad o tipo si puedes, y sugiere un top 3:\n\n${prompt}`,
      },
    ];

    return this.chat(messages);
  }
  async startChatWithContext(userId: number, title?: string) {
    // 1. Buscar bots
    const bots = await this.prisma.bot.findMany({
      take: 500,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        description: true,
        sourcePlatform: true,
      },
    });

    const botContext = bots
      .map((bot) => {
        return `Bot: ${bot.name}\nDescripción: ${bot.description}\nPlataforma: ${bot.sourcePlatform}`;
      })
      .join('\n\n');

    // 2. Crear mensajes iniciales
    const messages = [
      {
        role: 'system',
        content:
          'Eres un experto en análisis de bots. Este es el contexto inicial de bots para análisis.',
      },
      {
        role: 'user',
        content: `Aquí tienes 500 bots de distintas plataformas. Úsalos como contexto para futuras respuestas:\n\n${botContext} debes usar estos bots para las siguietnes preguntas que te haga el usuario
        tienes permitido buscar en internet pero solo sobre los bots que te he dado como contexto para completar la respuesta de froma mas obtima`,
      },
    ];

    // 3. Llamar al modelo
    const response = await this.chat(messages);
    const assistantReply = response.choices[0].message.content;

    // 4. Añadir respuesta
    messages.push({ role: 'assistant', content: assistantReply });

    // 5. Guardar en la DB
    const session = await this.prisma.chatSession.create({
      data: {
        title: title ?? 'Nueva conversación',
        userId,
        model: 'meta-llama/llama-4-maverick:free',
        messages,
      },
    });

    // 6. Devolver respuesta y sessionId
    return {
      reply: assistantReply,
      sessionId: session.id,
      title: session.title,
    };
  }
  async continueChatSession(sessionId: string, userMessage: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Sesión de chat no encontrada');
    }

    const messages = session.messages as any[];

    messages.push({ role: 'user', content: userMessage });

    const response = await this.chat(messages, session.model);
    const assistantReply = response.choices[0].message.content;

    messages.push({ role: 'assistant', content: assistantReply });

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { messages },
    });

    return { reply: assistantReply, sessionId };
  }
  async recommendWorkflow(userId: number, goal: string) {
    const bots = await this.prisma.bot.findMany({
      take: 500,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        sourcePlatform: true,
      },
    });

    const botList = bots
      .map(
        (bot) =>
          `Bot: ${bot.name}\nDescripción: ${bot.description}\nPlataforma: ${bot.sourcePlatform}`,
      )
      .join('\n\n');

    const messages = [
      {
        role: 'system',
        content: 'Eres un experto en diseño de workflows para bots.',
      },
      {
        role: 'user',
        content: `Objetivo del usuario: "${goal}".\n\nTienes acceso a los siguientes bots (no puedes utilizar otros):\n\n${botList}
  
  ⚠️ Solo puedes proponer bots que aparezcan en esta lista. No inventes nombres, ni utilices bots que no se encuentren en la lista.
  
  Genera un objeto JSON **válido y completo** con los siguientes campos obligatorios:
  
  - name: nombre del workflow.
  - description: una descripción extensa que incluya una guía paso a paso para instalar, configurar y usar correctamente cada bot del workflow. Incluye también qué problema resuelve cada uno.
  - tags: array de etiquetas relacionadas.
  - botIds: array de strings con los **nombres exactos** de los bots utilizados.
  - configJson: objeto con la configuración detallada de cada bot.
  
  Devuelve **únicamente** el JSON válido. Sin texto adicional.`,
      },
    ];

    const response = await this.chat(messages);
    let assistantReply = response.choices?.[0]?.message?.content;

    console.log('[RAW LLM Response]', assistantReply);

    if (!assistantReply) {
      return {
        goal,
        error: 'La respuesta del modelo es inválida o vacía.',
      };
    }

    assistantReply = assistantReply
      .replace(/^```json\n?/i, '')
      .replace(/```$/, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(assistantReply);
      console.log('[Parsed Workflow JSON]', parsed);
    } catch (err) {
      console.error('[Error parsing LLM response as JSON]', err);
      return {
        goal,
        error: 'No se pudo interpretar el workflow como JSON válido.',
        raw: assistantReply,
      };
    }

    const botNameToId = new Map(bots.map((bot) => [bot.name, bot.id]));
    const botIds: string[] = [];

    for (const botName of parsed.botIds || []) {
      const botId = botNameToId.get(botName);
      if (botId) botIds.push(botId);
    }

    const createdWorkflow = await this.prisma.workflow.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        useCase: goal,
        tags: parsed.tags || [],
        configJson: parsed.configJson ?? {},
        isPublic: true,
        creator: {
          connect: { id: userId },
        },
        bots: {
          connect: botIds.map((id) => ({ id })),
        },
      },
      include: {
        creator: true,
        bots: true,
      },
    });

    return {
      message: 'Workflow creado correctamente.',
      workflow: createdWorkflow,
    };
  }
}
