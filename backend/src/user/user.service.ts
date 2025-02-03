import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: 'ADMIN' | 'SUPERUSER' | 'USER';
    profilePicture?: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        profilePicture: data.profilePicture,
      },
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
  async deleteUser(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    await this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
  async updateUser(
    id: number,
    updateUserDto: {
      email?: string;
      password?: string;
      name?: string;
      role?: 'SUPERUSER' | 'ADMIN' | 'USER';
      profilePicture?: string;
    },
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        ...updateUserDto,
      },
    });
  }
}
