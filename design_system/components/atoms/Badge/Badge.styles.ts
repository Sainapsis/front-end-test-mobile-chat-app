import { StyleSheet } from 'react-native';
import { colors, typography } from '@/design_system/ui/tokens';
import { componentStyles, flexStyles } from '@/design_system/ui/styles';

export const styles = StyleSheet.create({
  container: {
    ...componentStyles.badge,
    ...flexStyles.center,
  },
  text: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.normal,
  },
});