import { UserRepository } from "@/src/data/interfaces/user.interface";

export const getUsers = (repository: UserRepository) => async () => {
  const users = await repository.getUsers();

  return users;
};
