import { User } from '@/src/domain/entities/user';

export interface UserContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}
