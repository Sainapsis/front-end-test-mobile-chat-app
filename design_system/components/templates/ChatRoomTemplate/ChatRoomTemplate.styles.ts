import { StyleSheet } from 'react-native';
import { colors, spacing, themes } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) =>StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes[theme].background?.elevated
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'trasparent',
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
    color: themes[theme].text?.primary, // Usar el color de texto primario del them
    backgroundColor: themes[theme].background?.elevated,
  },
  sendButton: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
});