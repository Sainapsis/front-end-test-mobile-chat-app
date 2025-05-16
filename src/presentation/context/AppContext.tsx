import React, { createContext, useContext, ReactNode } from "react";
import { useDatabase } from "../hooks/useDatabase";
import { useUser } from "@/src/presentation/hooks/useUser";
import { DatabaseContext } from "@/src/presentation/context/DatabaseProvider";
import { UserContext } from "./UserContext";
import { AuthContext } from "./AuthContext";

interface AppContextType {
  dbInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function AppContent({ children }: { children: ReactNode }) {
  const { isInitialized } = useDatabase();
  const userContext = useUser();
  
  const value = {
    ...userContext,
    dbInitialized: isInitialized,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ chatId, children }: { chatId: string; children: ReactNode }) {
  return (
    <DatabaseContext>
      <AuthContext>
        <UserContext>
          <AppContent>{children}</AppContent>
        </UserContext>
      </AuthContext>
    </DatabaseContext>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
