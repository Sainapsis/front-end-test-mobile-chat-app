import { StyleSheet } from 'react-native';
import { spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  resultsContainer: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconButton: {
    padding: spacing.sm,
  },
});