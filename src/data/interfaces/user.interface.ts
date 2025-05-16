import { User } from '@/src/domain/entities/user';

export interface UserRepository {
  getUsers: () => Promise<User[]>;
}
