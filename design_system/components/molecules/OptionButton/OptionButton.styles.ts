import { StyleSheet } from 'react-native';
import { spacing, typography } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  optionText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    marginLeft: spacing.sm,
  },
});