import { Query, Resolver, Args, ID } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { Bot } from 'src/@generated/prisma-graphql/bot/bot.model';

@Resolver('Bot')
export class BotResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [Bot])
  async bots() {
    return this.prisma.bot.findMany({
      include: {
        images: true,
        features: true,
        permissions: true,
        technicalDetails: true,
        links: true,
      },
    });
  }

  @Query(() => Bot, { nullable: true })
  async bot(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.bot.findUnique({
      where: { id },
      include: {
        images: true,
        features: true,
        permissions: true,
        technicalDetails: true,
        links: true,
      },
    });
  }
}
