import { StyleSheet } from 'react-native';
import { colors, typography } from '@/design_system/ui/tokens';

export const typographyStyles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  body: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  caption: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
});