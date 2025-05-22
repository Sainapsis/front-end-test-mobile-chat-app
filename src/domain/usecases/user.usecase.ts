import {
  LoginParams,
  UserRepository,
} from "@/src/data/interfaces/user.interface";

export const userLogin =
  (repository: UserRepository) =>
  async ({ userId }: LoginParams) => {
    const user = await repository.login({ userId });

    return user;
  };

export const getUsers =
  (repository: UserRepository) =>
  async ({ page }: { page?: number }) => {
    const users = await repository.getUsers({ page });

    return users;
  };
