import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

import { db } from '../server.js';
import { ApiError, mailSender, PasswordHash } from '../utils/_index.ts';
import { emailVerifications, resetPassword, usersTable, type User } from '../db/schema/users.js';
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
      await db
        .update(usersTable)
        .set({ lastLoginAt: new Date() })
        .where(eq(usersTable.id, user[0].id));
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
          await mailSender({ to: candidate.email, name: candidate.name, token, type: 'emailConfirmation' });
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
          await mailSender({ to: candidate.email, name: candidate.name, token, type: 'emailConfirmation' });
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
      await mailSender({ to: newUser[0].email, name: newUser[0].name, token, type: 'emailConfirmation' });
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
      const user = await db
        .update(usersTable)
        .set({ isEmailVerified: true })
        .where(eq(usersTable.id, emailVerification[0].userId))
        .returning();
      if (user?.length === 0 || !user[0]) {
        throw ApiError.notFound('User not found');
      }
      await db
        .update(emailVerifications)
        .set({ verifiedAt: new Date(), token: null })
        .where(eq(emailVerifications.userId, emailVerification[0].userId));
      await mailSender({ to: user[0].email, name: user[0].name, type: 'welcome' });
      
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to verify email');
    }
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (user?.length === 0 || !user[0]) {
        throw ApiError.notFound('User with this email does not exist');
      }
      if (user[0].isEmailVerified) {
        throw ApiError.badRequest('Email is already verified');
      }
      const token = this.cryptoToken();
      await mailSender({ to: user[0].email, name: user[0].name, token, type: 'emailConfirmation' });
      const emailVerification = await db.select().from(emailVerifications).where(eq(emailVerifications.userId, user[0].id)).limit(1);
      if (emailVerification?.length === 0 || !emailVerification[0]) {
        await db.insert(emailVerifications).values({
          userId: user[0].id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
        });
      } else {
        await db
          .update(emailVerifications)
          .set({
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
          })
          .where(eq(emailVerifications.userId, user[0].id));
      }
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to resend verification email');
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      if (user?.length === 0 || !user[0]) {
        throw ApiError.notFound('User with this email does not exist');
      }
      if (!user[0].isEmailVerified) {
        throw ApiError.badRequest('Email is not verified');
      }
      const token = this.cryptoToken();
      await mailSender({ to: user[0].email, name: user[0].name, token, type: 'passwordReset' });
      const resetPasswordRecord = await db.select().from(resetPassword).where(eq(resetPassword.userId, user[0].id)).limit(1);
      if (resetPasswordRecord?.length === 0 || !resetPasswordRecord[0]) {
        await db.insert(resetPassword).values({
          userId: user[0].id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
        });
      } else {
        await db
          .update(resetPassword)
          .set({
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiration
          })
          .where(eq(resetPassword.userId, user[0].id));
      }
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to reset password');
    }
  }

  static async setNewPassword(token: string, password: string): Promise<void> {
    try {
      const resetPasswordRecord = await db
        .select()
        .from(resetPassword)
        .where(eq(resetPassword.token, token.trim()))
        .limit(1);
      if (resetPasswordRecord?.length === 0 || !resetPasswordRecord[0]) {
        throw ApiError.badRequest('Invalid or expired password reset token');
      }
      if (resetPasswordRecord[0].expiresAt < new Date()) {
        throw ApiError.badRequest('Password reset token has expired. Please request a new password reset.');
      }
      const user = await db.select().from(usersTable).where(eq(usersTable.id, resetPasswordRecord[0].userId)).limit(1);
      if (user?.length === 0 || !user[0]) {
        throw ApiError.notFound('User not found');
      }
      if (!user[0].isEmailVerified) {
        throw ApiError.badRequest('Email is not verified');
      }
      const isSame = await PasswordHash.comparePassword(password, user[0].passwordHash || '');
      if (isSame) {
        throw ApiError.badRequest('New password must be different from the old password');
      }
      const hashedPassword = await PasswordHash.hashPassword(password);
      await db
        .update(usersTable)
        .set({ passwordHash: hashedPassword })
        .where(eq(usersTable.id, resetPasswordRecord[0].userId));
      await db
        .update(resetPassword)
        .set({ token: null, changedAt: new Date() })
        .where(eq(resetPassword.userId, resetPasswordRecord[0].userId));
    } catch (error) {
      throw ApiError.badRequest(error instanceof Error ? error.message : 'Failed to update password');
    }
  }
}

export { AuthService };
