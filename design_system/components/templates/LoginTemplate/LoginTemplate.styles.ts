import { StyleSheet } from 'react-native';
import { spacing, colors } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.lg, 
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
