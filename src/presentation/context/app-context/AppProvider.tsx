import { ReactNode, useMemo } from "react";
import { AppContext } from "./AppContext";
import { DatabaseProvider } from "@/src/presentation/context/DatabaseProvider";
import { useDatabase } from "../../hooks/useDatabase";

interface Props {
  children: ReactNode;
}

function AppContent({ children }: Props) {
  const { isInitialized } = useDatabase();
  const loading = !isInitialized;

  const value = useMemo(
    () => ({
      loading,
      dbInitialized: isInitialized,
    }),
    [isInitialized, loading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: Props) {
  return (
    <DatabaseProvider>
      <AppContent>{children}</AppContent>
    </DatabaseProvider>
  );
}
