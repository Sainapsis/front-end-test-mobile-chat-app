import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.normal,
  },
});