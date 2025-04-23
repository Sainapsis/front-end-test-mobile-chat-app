import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './apiMocks';
import NetInfo from '@react-native-community/netinfo';

// Storage keys
const LAST_SYNC_KEY = 'lastSyncTimestamp';
const PENDING_OPERATIONS_KEY = 'pendingOperations';

// Types for pending operations
type OperationType = 'create' | 'update' | 'delete';
type ResourceType = 'user' | 'chat' | 'message';

interface PendingOperation {
  id: string;
  type: OperationType;
  resource: ResourceType;
  data: any;
  timestamp: number;
}

class SyncService {
  private isOnline: boolean = false;
  private lastSyncTimestamp: number = 0;
  private pendingOperations: PendingOperation[] = [];
  private syncInProgress: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Load last sync timestamp
      const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
      this.lastSyncTimestamp = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
      
      // Load pending operations
      const pendingOpsStr = await AsyncStorage.getItem(PENDING_OPERATIONS_KEY);
      this.pendingOperations = pendingOpsStr ? JSON.parse(pendingOpsStr) : [];
      
      // Setup network state monitoring
      NetInfo.addEventListener(state => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected ?? false;
        
        // If we just came back online, trigger a sync
        if (wasOffline && this.isOnline) {
          this.syncWithServer();
        }
      });
      
      // Initial network check
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected ?? false;
      
      // If online at startup, attempt initial sync
      if (this.isOnline) {
        this.syncWithServer();
      }
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  // Add pending operation when offline
  public async addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>) {
    const newOperation: PendingOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    this.pendingOperations.push(newOperation);
    await this.savePendingOperations();
    
    // Try to sync if we're online
    if (this.isOnline) {
      this.syncWithServer();
    }
    
    return newOperation.id;
  }

  // Manually trigger synchronization
  public async syncWithServer() {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, reason: this.syncInProgress ? 'Sync already in progress' : 'Offline' };
    }
    
    try {
      this.syncInProgress = true;
      
      // 1. Process any pending operations
      await this.processPendingOperations();
      
      // 2. Sync users
      await api.users.sync();
      
      // 3. Sync chats
      await api.chats.sync();
      
      // 4. Update last sync timestamp
      this.lastSyncTimestamp = Date.now();
      await AsyncStorage.setItem(LAST_SYNC_KEY, this.lastSyncTimestamp.toString());
      
      return { success: true };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, error };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process pending operations
  private async processPendingOperations() {
    if (this.pendingOperations.length === 0) {
      return;
    }
    
    const operationsToProcess = [...this.pendingOperations];
    const successfulOps: string[] = [];
    
    for (const op of operationsToProcess) {
      try {
        let success = false;
        
        // Handle different operation types
        switch (op.resource) {
          case 'user':
            if (op.type === 'update') {
              await api.users.update(op.data.id, op.data);
              success = true;
            }
            break;
            
          case 'chat':
            if (op.type === 'create') {
              await api.chats.create(op.data);
              success = true;
            }
            break;
            
          case 'message':
            if (op.type === 'create') {
              await api.messages.send(op.data);
              success = true;
            }
            break;
        }
        
        if (success) {
          successfulOps.push(op.id);
        }
      } catch (error) {
        console.error(`Failed to process operation ${op.id}:`, error);
      }
    }
    
    // Remove successful operations
    this.pendingOperations = this.pendingOperations.filter(op => !successfulOps.includes(op.id));
    await this.savePendingOperations();
  }

  // Save pending operations to AsyncStorage
  private async savePendingOperations() {
    await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(this.pendingOperations));
  }

  // Get sync status
  public getSyncStatus() {
    return {
      isOnline: this.isOnline,
      lastSyncTimestamp: this.lastSyncTimestamp,
      pendingOperationsCount: this.pendingOperations.length,
      syncInProgress: this.syncInProgress
    };
  }
}

// Create singleton instance
export const syncService = new SyncService(); 