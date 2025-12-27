export interface UserCreate {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  role?: string;
}

export interface UserUpdate {
  name?: string;
  password?: string;
  passwordHash?: string;
  avatarUrl?: string;
  role?: string;
  isEmailVerified?: boolean;
}