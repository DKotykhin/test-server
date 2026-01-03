export interface UserUpdate {
  name?: string;
  password?: string;
  passwordHash?: string;
  avatarUrl?: string;
  role?: string;
  isEmailVerified?: boolean;
}
