import { db } from "@/src/infrastructure/queries/db";
import { users } from "@/src/infrastructure/schema";
import { LoginParams } from "@/src/data/interfaces/user.interface";
import { User } from '@/src/domain/entities/user';
import { eq } from "drizzle-orm";

export const loginDB = async ({ userId }: LoginParams): Promise<User> => {
  const user = await db.select().from(users).where(eq(users.id, userId));

  return user[0];
};

export const getUsersDB = async (): Promise<User[]> => {
  const usersDB = await db.select().from(users);

  return usersDB;
};
