import { boolean, pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel, relations } from "drizzle-orm";

export const userRoles = ['user', 'admin', 'moderator', 'guest'] as const;

// Users table definition
export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: varchar({ enum: userRoles }).notNull().default('user'),
  avatarUrl: varchar('avatar_url', { length: 512  }),
  passwordHash: varchar('password_hash', { length: 512 }),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  lastLoginAt: timestamp('last_login_at'),
  isBanned: boolean('is_banned').notNull().default(false),
  banReason: varchar('ban_reason', { length: 1024 }),
  bannedAt: timestamp('banned_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;

// Password reset tokens table definition
export const resetPassword = pgTable("reset_password", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar({ length: 512 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  changedAt: timestamp('changed_at'),
});

export const resetPasswordRelations = relations(usersTable, ({ one }) => ({
  user: one(resetPassword, { fields: [usersTable.id], references: [resetPassword.userId] }),
}));

export type ResetPassword = InferSelectModel<typeof resetPassword>;
export type NewResetPassword = InferInsertModel<typeof resetPassword>;

// Email verifications table definition
export const emailVerifications = pgTable("email_verifications", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  token: varchar({ length: 512 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  verifiedAt: timestamp('verified_at'),
});

export const emailVerificationsRelations = relations(usersTable, ({ one }) => ({
  user: one(emailVerifications, { fields: [usersTable.id], references: [emailVerifications.userId] }),
}));

export type EmailVerification = InferSelectModel<typeof emailVerifications>;
export type NewEmailVerification = InferInsertModel<typeof emailVerifications>;
