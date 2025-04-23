import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { syncService } from "../services/syncService";
import SyncStatus from "./SyncStatus";

interface SyncServiceContextType {
  isInitialized: boolean;
}

const SyncServiceContext = createContext<SyncServiceContextType>({
  isInitialized: false,
});

export const useSyncServiceStatus = () => useContext(SyncServiceContext);

interface SyncServiceProviderProps {
  children: ReactNode;
  showStatusBar?: boolean;
}

export function SyncServiceProvider({
  children,
  showStatusBar = true,
}: SyncServiceProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Wait for sync service to be initialized
    const checkInitialization = () => {
      if (syncService.getSyncStatus().lastSyncTimestamp !== 0) {
        if (mounted) {
          setIsInitialized(true);
          setInitializing(false);
        }
      } else {
        // Check again in 100ms
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();

    return () => {
      mounted = false;
    };
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Initializing sync service...</Text>
      </View>
    );
  }

  return (
    <SyncServiceContext.Provider value={{ isInitialized }}>
      {showStatusBar && <SyncStatus />}
      {children}
    </SyncServiceContext.Provider>
  );
}
