import { Controller, Post, Delete, Get, Param, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':userId/:botId')
  async create(@Param('userId') userId: number, @Param('botId') botId: string) {
    return this.favoritesService.create(+userId, botId);
  }

  @Delete(':userId/:botId')
  async remove(@Param('userId') userId: number, @Param('botId') botId: string) {
    return this.favoritesService.remove(+userId, botId);
  }

  @Get(':userId')
  async findAllByUser(@Param('userId') userId: number) {
    return this.favoritesService.findAllByUser(+userId);
  }

  @Get(':userId/check')
  async isFavorite(
    @Param('userId') userId: number,
    @Query('botId') botId: string,
  ) {
    return this.favoritesService.isFavorite(+userId, botId);
  }
}
