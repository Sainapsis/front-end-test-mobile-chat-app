import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  loadingContainer: {
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
  },
});