import { db } from "@/src/infrastructure/queries/db";
import { users } from "@/src/infrastructure/schema";
import { LoginParams } from "@/src/data/interfaces/user.interface";
import { User } from "@/src/domain/entities/user";
import { eq } from "drizzle-orm";

export const loginDB = async ({ userId }: LoginParams): Promise<User> => {
  const user = await db.select().from(users).where(eq(users.id, userId));

  return user[0];
};

export const getUsersDB = async ({
  page = 0,
}: {
  page?: number;
}): Promise<User[]> => {
  const LIMIT = 10;

  const usersDB = await db
    .select()
    .from(users)
    .limit(LIMIT)
    .offset(page * LIMIT);

  return usersDB;
};

export const getUserByIdDB = async ({
  userId,
}: {
  userId: string;
}): Promise<User | null> => {
  const user = await db.select().from(users).where(eq(users.id, userId));

  return user[0] || null;
};
