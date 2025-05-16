import { getUsersDB } from "@/src/infrastructure/database/user.database";
import { UserRepository } from "../interfaces/user.interface";

export const userRepository: UserRepository = {
  getUsers: async () => {
    const users = await getUsersDB();

    return users;
  },
};
