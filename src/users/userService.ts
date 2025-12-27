import { eq } from 'drizzle-orm';
import type { QueryResult } from 'pg';

import { db } from '../server.js';
import ApiError from '../utils/apiError.ts';
import { usersTable, type User } from '../db/schema/users.js';
import { PasswordHash } from '../utils/passwordHash.ts';
import type { UserCreate, UserUpdate } from './userTypes.ts';

class UserService {
  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user?.length === 0 || !user[0]) {
        return null;
      }
      const { passwordHash, ...userWithoutPasswordHash } = user[0];
      return userWithoutPasswordHash;
    } catch (error) {
      throw ApiError.badRequest('Failed to get user by ID');
    }
  }

  static async getUserByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (user?.length === 0 || !user[0]) {
        return null;
      }
      const { passwordHash, ...userWithoutPasswordHash } = user[0];
      return userWithoutPasswordHash;
    } catch (error) {
      throw ApiError.badRequest('Failed to get user by email');
    }
  }

  static async createUser(userData: UserCreate): Promise<Omit<User, 'passwordHash'> | null> {
    try {
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
      const { passwordHash, ...userWithoutPasswordHash } = newUser[0];
      return userWithoutPasswordHash;
    } catch (error) {
      throw ApiError.badRequest('Failed to create user');
    }
  }

  static async updateUser(userId: string, updateData: UserUpdate): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      if (updateData.password) {
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
      throw ApiError.badRequest('Failed to update user');
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

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      const passwordHash = await PasswordHash.hashPassword(newPassword);
      await db
        .update(usersTable)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(usersTable.id, id));
    } catch (error) {
      throw ApiError.badRequest('Failed to update password');
    }
  }

  static async isEmailVerified(email: string): Promise<boolean> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (user?.length === 0 || !user[0]) {
        throw ApiError.notFound('User not found');
      }
      return user[0].isEmailVerified || false;
    } catch (error) {
      throw ApiError.badRequest('Failed to check email verification status');
    }
  }
}

export default UserService;
