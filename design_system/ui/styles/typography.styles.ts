import { StyleSheet } from 'react-native';
import { colors, typography } from '@/design_system/ui/tokens';

export const typographyStyles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
  },
  body: {
    fontSize: typography.sizes.md,
  },
  caption: {
    fontSize: typography.sizes.sm,
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