import { LoginParams } from "@/src/data/interfaces/user.interface";
import { userRepository } from "@/src/data/repositories/user.repository";
import { User } from "@/src/domain/entities/user";
import { getUsers, userLogin } from "@/src/domain/usecases/user.usecase";
import { useCallback, useEffect, useState } from "react";

export function useUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsersImpl();
  }, []);

  const loadUsersImpl = useCallback(async () => {
    try {
      const usersData = await getUsers(userRepository)();
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    setCurrentUser(null);
  }, []);

  return {
    loading,
    users,
    currentUser,
    isLoggedIn: !!currentUser,
    login: loginImpl,
    logout: logoutImpl,
  };
}
