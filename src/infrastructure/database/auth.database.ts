import { db } from "@/src/infrastructure/queries/db";
import { users } from "@/src/infrastructure/schema";
import { User } from '@/src/domain/entities/user';
import { eq } from "drizzle-orm";
import { LoginParams } from '@/src/data/interfaces/auth.interface';

export const loginDB = async ({ userId }: LoginParams): Promise<User> => {
  const user = await db.select().from(users).where(eq(users.id, userId));

  return user[0];
};