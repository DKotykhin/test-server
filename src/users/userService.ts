import { eq } from 'drizzle-orm';

import { db } from '../server.js';
import { usersTable } from '../db/schema/users.js';
import { PasswordHash } from '../utils/passwordHash.ts';
import ApiError from '../utils/apiError.ts';
import type { UserData } from './userTypes.ts';

class UserService {
  static async getUserById(userId: string) {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user?.length === 0 || !user[0]) {
        return null;
      }
      const { passwordHash, ...userWithoutPassword } = user[0];
      return userWithoutPassword;
    } catch (error) {
      throw ApiError.badRequest('Failed to get user by ID');
    }
  }

  static async getUserByEmail(email: string) {
    const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (user?.length === 0 || !user[0]) {
      return null;
    }
    const { passwordHash, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  }

  static async createUser(userData: UserData) {
    const newUser = await db
      .insert(usersTable)
      .values({
        ...userData,
        passwordHash: await PasswordHash.hashPassword(userData.password),
      })
      .returning();
    if (newUser?.length === 0 || !newUser[0]) {
      throw new Error('Failed to create user');
    }
    const { passwordHash, ...userWithoutPassword } = newUser[0];
    return userWithoutPassword;
  }

  static async updateUserEmailVerificationStatus(userId: string, isVerified: boolean) {
    const [updatedUser] = await db
      .update(usersTable)
      .set({ isEmailVerified: isVerified, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    return updatedUser;
  }
}

export default UserService;
