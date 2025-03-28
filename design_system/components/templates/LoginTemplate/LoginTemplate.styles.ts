import { StyleSheet } from 'react-native';
import { spacing, colors } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.neutral[500],
  },
});