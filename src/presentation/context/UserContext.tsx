import { User } from "@/src/domain/entities/user";
import { createContext, useContext, ReactNode } from "react";
import { useUser } from "../hooks/useUser";
import { useAuthContext } from './AuthContext';

interface UserContextType {
  users: User[];
}

const _UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContext({ children }: { children: ReactNode; }) {
  const { currentUser } = useAuthContext();
  const { users } = useUser();

  const value = {
    users,
    currentUser,
  };

  return (
    <_UserContext.Provider value={value}>{children}</_UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(_UserContext);

  if (context === undefined) {
    throw new Error("useUserContext must be used within an AppProvider");
  }

  return context;
}
