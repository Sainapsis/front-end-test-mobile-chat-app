import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  skeletonItem: {
    marginBottom: spacing.md,
    borderRadius: spacing.sm,
  },
  deleteAction: {
    backgroundColor: colors.error.main,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
});