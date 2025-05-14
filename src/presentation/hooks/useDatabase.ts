import { useDatabaseStatus } from '@/src/presentation/context/DatabaseProvider';

export function useDatabase() {
  return useDatabaseStatus();
} 