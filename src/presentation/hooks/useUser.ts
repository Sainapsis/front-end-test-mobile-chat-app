import { userRepository } from "@/src/data/repositories/user.repository";
import { User } from "@/src/domain/entities/user";
import { getUsers } from "@/src/domain/usecases/user.usecase";
import { useCallback, useEffect, useState } from "react";

export function useUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsersImpl();
  }, []);

  const loadUsersImpl = useCallback(async () => {
    try {
      const usersData = await getUsers(userRepository)();

      if (usersData) {
        setUsers(usersData);
        return;
      }
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
