import { db } from "@/src/infrastructure/queries/db";
import { users } from "@/src/infrastructure/schema";
import { User } from '@/src/domain/entities/user';

export const getUsersDB = async (): Promise<User[]> => {
  const usersDB = await db.select().from(users);

  return usersDB;
};
