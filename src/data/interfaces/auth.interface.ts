import { User } from '@/src/domain/entities/user';

export interface LoginParams {
  userId: string;
}

export interface AuthRepository {
  login: ({ userId }: LoginParams) => Promise<User>;
}
