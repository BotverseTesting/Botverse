import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Security } from 'src/utils/security';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    const validPassword = Security.validatePassword(pass, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }
    const payload = { sub: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
