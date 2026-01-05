import type { userRoles } from '../db/schema/users.ts';

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role?: typeof userRoles[number];
}
