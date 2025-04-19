import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { Validations } from 'src/utils/validations';
import { Roles } from 'src/utils/roles.decorator';

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

  @Get('by-email')
  @Roles('SUPERUSER')
  async getUserByEmail(@Query('email') email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!Validations.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateUserDto: {
      password?: string;
      name?: string;
      role?: 'SUPERUSER' | 'ADMIN' | 'USER';
      profilePicture?: string;
    },
  ): Promise<User> {
    const userExists = await this.userService.getUserById(id);
    if (!userExists) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (
      updateUserDto.role &&
      !['SUPERUSER', 'ADMIN', 'USER'].includes(updateUserDto.role)
    ) {
      throw new BadRequestException('Invalid role');
    }

    return this.userService.updateUser(id, updateUserDto);
  }
}
