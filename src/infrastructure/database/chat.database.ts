import { db } from "@/database/db";
import { messages } from "@/database/schema";
import { MessageStatus } from "@/src/domain/entities/message";
import { eq } from "drizzle-orm";

export const updateStatusMessageDB = async (
  messageId: string,
  status: MessageStatus
): Promise<void> => {
  await db.update(messages).set({ status }).where(eq(messages.id, messageId));
};
