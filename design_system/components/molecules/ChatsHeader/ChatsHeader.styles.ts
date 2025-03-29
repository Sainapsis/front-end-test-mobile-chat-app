import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
  },
  clearAllButton: {
    backgroundColor: colors.error.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  clearAllText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
});