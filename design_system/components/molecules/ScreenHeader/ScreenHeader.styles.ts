import { StyleSheet } from 'react-native';
import { spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  }
});