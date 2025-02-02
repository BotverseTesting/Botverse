import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body()
    createUserDto: {
      email: string;
      password: string;
      name: string;
      role: 'SUPERUSER' | 'ADMIN' | 'USER';
      profilePicture?: string;
    },
  ): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get('all')
  async getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
