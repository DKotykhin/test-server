import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

import { db } from '../server.js';
import { ApiError, mailSender, PasswordHash } from '../utils/_index.ts';
import { emailVerifications, usersTable, type User } from '../db/schema/users.js';
import type { UserCreate } from './authTypes.ts';

class AuthService {
  static cryptoToken(): string {
    const buffer = crypto.randomBytes(16);
    if (!buffer) {
      throw ApiError.internal('Failed to generate token');
    }
    return buffer.toString('hex');
  }

  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      if (user?.length === 0 || !user[0]) {
        return null;
      }
      return user[0];
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

  static async signIn(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (user?.length === 0 || !user[0]) {
        throw ApiError.unauthorized('Invalid email or password');
      }
      const isPasswordValid = await PasswordHash.comparePassword(password, user[0].passwordHash || '');
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
      }
      return user[0];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.badRequest('Failed to sign in');
    }
  }

  static async signUp(userData: UserCreate): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const candidate = await this.getUserByEmail(userData.email);
      if (candidate?.isEmailVerified) {
        throw ApiError.conflict('Email is already in use');
      }
      if (candidate) {
        const emailVerification = await db.select().from(emailVerifications).where(eq(emailVerifications.userId, candidate.id)).limit(1);
        if (emailVerification?.length === 0 || !emailVerification[0]) {
          const token = this.cryptoToken();
          await mailSender({ to: candidate.email, name: candidate.name, token });
          await db.insert(emailVerifications).values({
            userId: candidate.id,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
          });
          throw ApiError.conflict(
            'Email is already registered but not verified. A new verification email has been sent. Please check your email to verify your account.'
          );
        }
        if (emailVerification[0] && emailVerification[0].expiresAt > new Date()) {
          throw ApiError.conflict('Email is already registered but not verified. Please check your email to verify your account.');
        }
        if (emailVerification[0] && emailVerification[0].expiresAt <= new Date()) {
          const token = this.cryptoToken();
          await mailSender({ to: candidate.email, name: candidate.name, token });
          await db
            .update(emailVerifications)
            .set({
              token,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
            })
            .where(eq(emailVerifications.userId, candidate.id));
          throw ApiError.conflict(
            'Email is already registered but not verified. A new verification email has been sent. Please check your email to verify your account.'
          );
        }
      }
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
      const token = this.cryptoToken();
      await mailSender({ to: newUser[0].email, name: newUser[0].name, token });
      await db.insert(emailVerifications).values({
        userId: newUser[0].id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
      });

      return newUser[0];
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to create user');
    }
  }

  static async verifyEmail(token: string): Promise<void> {
    try {
      const emailVerification = await db
        .select()
        .from(emailVerifications)
        .where(eq(emailVerifications.token, token.trim()))
        .limit(1);
      if (emailVerification?.length === 0 || !emailVerification[0]) {
        throw ApiError.badRequest('Invalid or expired verification token');
      }
      if (emailVerification[0].expiresAt < new Date()) {
        throw ApiError.badRequest('Verification token has expired');
      }
      await db
        .update(usersTable)
        .set({ isEmailVerified: true })
        .where(eq(usersTable.id, emailVerification[0].userId));
      await db
        .update(emailVerifications)
        .set({ verifiedAt: new Date(), token: null })
        .where(eq(emailVerifications.userId, emailVerification[0].userId));
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to verify email');
    }
  }
}

export { AuthService };
