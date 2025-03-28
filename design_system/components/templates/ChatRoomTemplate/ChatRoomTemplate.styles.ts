import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messagesContainer: {
    padding: spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.sm,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 20,
    padding: spacing.sm,
    maxHeight: 100,
    backgroundColor: colors.neutral[50],
  },
  sendButton: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
});