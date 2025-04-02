import { useDatabaseStatus } from '@/providers/database/DatabaseProvider';

export function useDatabase() {
  return useDatabaseStatus();
} 