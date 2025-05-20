import { userRepository } from "@/src/data/repositories/user.repository";
import { getUsers } from "@/src/domain/usecases/user.usecase";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "../context/user-context/UserContext";
import { User } from "@/src/domain/entities/user";

export function useUser() {
  const { users, setUsers } = useUserContext();

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    loadUsersImpl();
  }, []);

  const loadUsersImpl = useCallback(async () => {
    try {
      const usersData = await getUsers(userRepository)({ page });
      setUsers(usersData);
      setPage(page + 1);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMoreUsersImpl = useCallback(async () => {
    try {
      const _users = await getUsers(userRepository)({ page });

      if (_users) {
        setUsers((prevUsers) => {
          const newUsers = _users.filter(
            ({ id }: User) => !prevUsers.some((prevUsr) => prevUsr.id === id)
          );
          return [...prevUsers, ...newUsers];
        });

        setPage(page + 1);
      }
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return {
    loading,
    users,
    handleLoadMoreUsers: handleLoadMoreUsersImpl,
  };
}
