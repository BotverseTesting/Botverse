import * as bcrypt from 'bcrypt-ts';

export class Security {
  public static hashPassword(password: string): string {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      return hashedPassword;
    } catch {
      throw new Error('Error hashing password');
    }
  }
  public static validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): boolean {
    try {
      return bcrypt.compareSync(plainPassword, hashedPassword);
    } catch {
      throw new Error('Error validating password');
    }
  }
}
