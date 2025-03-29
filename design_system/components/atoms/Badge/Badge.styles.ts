import { StyleSheet } from 'react-native';
import { themes, typography } from '@/design_system/ui/tokens';
import { componentStyles, flexStyles } from '@/design_system/ui/styles';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) =>  StyleSheet.create({
  container: {
    ...componentStyles.badge,
    ...flexStyles.center,
  },
  text: {
    color: themes[theme].text?.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.normal,
  },
});