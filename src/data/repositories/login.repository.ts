import { loginDB } from '@/src/infrastructure/database/auth.database';
import { AuthRepository, LoginParams } from '../interfaces/auth.interface';

export const authRepository: AuthRepository = {
  login: async ({ userId }: LoginParams) => {
    const user = await loginDB({ userId });

    return user;
  },
};
