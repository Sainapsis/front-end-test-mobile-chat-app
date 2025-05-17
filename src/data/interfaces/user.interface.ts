import { User } from '@/src/domain/entities/user';

export interface LoginParams {
  userId: string;
}

export interface UserRepository {
  login: ({ userId }: LoginParams) => Promise<User>;
  getUsers: () => Promise<User[]>;
}
