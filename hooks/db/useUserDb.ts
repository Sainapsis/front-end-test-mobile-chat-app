// TP
import { useState, useEffect, useCallback } from "react";
import { eq } from "drizzle-orm";

// BL
import { users } from "../../lib/database/schema";
import { db } from "../../lib/database/db";
import { UserInterface } from "@/lib/interfaces/User.interface";

export function useUserDb() {
  const [allUsers, setAllUsers] = useState<UserInterface[]>([]);
  const [currentUser, setCurrentUser] = useState<UserInterface | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all users from the database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await db.select().from(users);
        setAllUsers(usersData);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const login = useCallback(async (userId: string) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId));

      if (!user || user.length === 0) {
        return false;
      }

      setCurrentUser(user[0]);
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return {
    users: allUsers,
    currentUser,
    login,
    logout,
    isLoggedIn: !!currentUser,
    loading,
  };
}
