import { userRepository } from "@/src/data/repositories/user.repository";
import { User } from "@/src/domain/entities/user";
import { getUsers } from "@/src/domain/usecases/user.usecase";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from '../context/user-context/UserContext';

export function useUser() {
  const { users, setUsers } = useUserContext();
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

  return {
    loading,
    users,
  };
}
