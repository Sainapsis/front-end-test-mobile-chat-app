import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { api } from '../services/apiMocks';

// Define the return type for the hook
interface UseSyncReturn {
  isOnline: boolean;
  lastSyncTimestamp: number;
  pendingOperationsCount: number;
  syncInProgress: boolean;
  syncWithServer: () => Promise<{ success: boolean; reason?: string; error?: any }>;
  createPendingOperation: (operation: {
    type: 'create' | 'update' | 'delete';
    resource: 'user' | 'chat' | 'message';
    data: any;
  }) => Promise<string>;
}

export function useSync(): UseSyncReturn {
  // Track sync status in state
  const [syncStatus, setSyncStatus] = useState(() => syncService.getSyncStatus());

  // Update sync status on interval
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncService.getSyncStatus());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Callback to create pending operations
  const createPendingOperation = useCallback(async (operation: {
    type: 'create' | 'update' | 'delete';
    resource: 'user' | 'chat' | 'message';
    data: any;
  }) => {
    return await syncService.addPendingOperation(operation);
  }, []);

  // Callback to manually sync with server
  const syncWithServer = useCallback(async () => {
    const result = await syncService.syncWithServer();
    setSyncStatus(syncService.getSyncStatus());
    return result;
  }, []);

  return {
    ...syncStatus,
    syncWithServer,
    createPendingOperation
  };
} 