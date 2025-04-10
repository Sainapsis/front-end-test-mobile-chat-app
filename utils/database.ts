import { db } from '@/database/db';
import { users as tableUsers } from '@/database/schema/users';
import { eq } from 'drizzle-orm';

export const updateUserInDatabase = async (updatedUser: { id: string; modificationDate: string }) => {
  try {
    await db.update(tableUsers)
      .set({ modificationDate: updatedUser.modificationDate })
      .where(eq(tableUsers.id, updatedUser.id));

    console.log('User updated in database');
  } catch (error) {
    console.error('Error updating user:', error);
  }
}; 