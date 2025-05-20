import { getUsersDB, loginDB } from "@/src/infrastructure/database/user.database";
import { LoginParams, UserRepository } from "../interfaces/user.interface";

export const userRepository: UserRepository = {
  login: async ({ userId }: LoginParams) => {
    const user = await loginDB({ userId });

    return user;
  },
  getUsers: async ({ page }: { page?: number }) => {
    const users = await getUsersDB({ page });

    return users;
  },
};
