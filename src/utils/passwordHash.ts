import * as bcrypt from 'bcryptjs';

export class PasswordHash {
  private static index = 5;

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.index);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}