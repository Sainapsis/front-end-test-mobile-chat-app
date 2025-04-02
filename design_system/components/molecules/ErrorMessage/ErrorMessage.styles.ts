import { StyleSheet } from 'react-native';
import { spacing, colors } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.error.light,
    borderRadius: spacing.xs,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  text: {
    color: colors.error.dark,
  }
});