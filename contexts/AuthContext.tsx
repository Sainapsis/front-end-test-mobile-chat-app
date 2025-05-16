import { User, useUser } from "@/hooks/useUser";
import { createContext, useContext } from "react";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  userLoading: boolean;
  isLoggedIn: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthContent({ children }: { children: React.ReactNode }) {
  const { users, currentUser, loading, login, logout } = useUser();

  const value = {
    currentUser,
    users,
    userLoading: loading,
    isLoggedIn: !!currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContent>
      {children}
    </AuthContent>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AppProvider');
  }
  return context;
}