import { LoginParams } from "@/src/data/interfaces/auth.interface";
import { createContext, ReactNode, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { User } from "@/src/domain/entities/user";

interface AuthContextType {
  currentUser: User | null;
  login: ({ userId }: LoginParams) => Promise<boolean>;
  logout: () => void;
}

const _AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContext({ children }: { children: ReactNode }) {
  const authContext = useAuth();

  const value = {
    ...authContext,
  };

  return (
    <_AuthContext.Provider value={value}>{children}</_AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(_AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AppProvider");
  }

  return context;
}
