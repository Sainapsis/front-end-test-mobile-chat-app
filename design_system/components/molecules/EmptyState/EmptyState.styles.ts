import { StyleSheet } from 'react-native';
import { spacing, typography } from '@/design_system/ui/tokens';

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
    maxWidth: '80%',
    marginBottom: spacing.xl,
  }
});