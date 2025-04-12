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
  public static async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }
}
