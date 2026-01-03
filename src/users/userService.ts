import { eq } from 'drizzle-orm';
import type { QueryResult } from 'pg';

import { db } from '../server.js';
import { ApiError } from '../utils/apiError.ts';
import { usersTable, type User } from '../db/schema/users.js';
import { PasswordHash } from '../utils/passwordHash.ts';
import type { UserUpdate } from './userTypes.ts';

class UserService {
  static async updateUser(userId: string, updateData: UserUpdate): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user?.length === 0 || !user[0]) {
        return null;
      }
      if (updateData.name) {
        updateData.name = updateData.name.trim();
        if (updateData.name === user[0].name) {
          throw ApiError.badRequest('New name is the same as the current name');
        }
      }
      if (updateData.password) {
        const isPasswordTheSame = await PasswordHash.comparePassword(updateData.password, user[0].passwordHash || '');
        if (isPasswordTheSame) {
          throw ApiError.badRequest('New password cannot be the same as the old password');
        }
        const passwordHash = await PasswordHash.hashPassword(updateData.password);
        if (passwordHash) {
          updateData.passwordHash = passwordHash;
          delete updateData.password;
        }
      }
      const [updatedUser] = await db
        .update(usersTable)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(usersTable.id, userId))
        .returning();
      if (!updatedUser) {
        return null;
      }
      const { passwordHash, ...userWithoutPasswordHash } = updatedUser;
      return userWithoutPasswordHash;
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to update user');
    }
  }

  static async deleteUser(userId: string): Promise<QueryResult> {
    try {
      const deleteResult = await db.delete(usersTable).where(eq(usersTable.id, userId));
      return deleteResult;
    } catch (error) {
      throw ApiError.badRequest('Failed to delete user');
    }
  }

  static async confirmPassword(id: string, password: string): Promise<boolean> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      if (user?.length === 0 || !user[0]) {
        return false;
      }
      const isPasswordValid = await PasswordHash.comparePassword(password, user[0].passwordHash || '');
      return isPasswordValid;
    } catch (error) {
      throw ApiError.badRequest('Failed to confirm password');
    }
  }
}

export { UserService };
