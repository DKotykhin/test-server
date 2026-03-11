import type { userRoles } from '../db/schema/users.ts';

export interface UserUpdate {
  name?: string;
  password?: string;
  passwordHash?: string;
  avatarUrl?: string;
  role?: typeof userRoles[number];
  isEmailVerified?: boolean;
}
