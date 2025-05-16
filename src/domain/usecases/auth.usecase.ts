import {
  AuthRepository,
  LoginParams,
} from "@/src/data/interfaces/auth.interface";

export const authLogin =
  (repository: AuthRepository) =>
  async ({ userId }: LoginParams) => {
    const user = await repository.login({ userId });

    return user;
  };
