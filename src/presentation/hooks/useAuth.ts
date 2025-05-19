import { LoginParams } from '@/src/data/interfaces/user.interface';
import { userRepository } from '@/src/data/repositories/user.repository';
import { userLogin } from '@/src/domain/usecases/user.usecase';
import { useCallback } from "react";
import { useAuthContext } from '../context/auth-context/AuthContext';

export function useAuth() {
  const { currentUser, setCurrentUser } = useAuthContext();

  const loginImpl = useCallback(async ({ userId }: LoginParams) => {
    try {
      const user = await userLogin(userRepository)({ userId });
      
      if (user) {
        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }, []);

  const logoutImpl = useCallback(() => {
    try {
      setCurrentUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, []);

  return {
    currentUser,
    login: loginImpl,
    logout: logoutImpl,
  };
}
