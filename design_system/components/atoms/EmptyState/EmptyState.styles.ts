import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@/design_system/ui/tokens';
import { colors as Colors } from '@/design_system/ui/tokens/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.tight,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    textAlign: 'center',
    color: colors.text.secondary,
    maxWidth: '80%',
    marginBottom: spacing.xl,
  },
  clearButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: Colors.light.tint,
  },
  clearButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.weights.semiBold,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.normal,
  },
});