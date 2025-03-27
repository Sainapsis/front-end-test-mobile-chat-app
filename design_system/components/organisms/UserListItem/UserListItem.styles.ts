import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  selectedContainer: {
    backgroundColor: colors.primary[100],
  },
  infoContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    fontFamily: typography.families.primary as string,
    fontWeight: typography.weights.regular,
  },
});