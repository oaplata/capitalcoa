export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: number;
  username: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
