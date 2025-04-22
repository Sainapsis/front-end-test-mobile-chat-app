import { Platform, StyleSheet } from 'react-native';
import { colors, spacing, themes } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const createStyles = (theme: Theme) => StyleSheet.create({
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
    paddingBottom: spacing.md,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: themes[theme].background?.elevated,
  },
  iosInputContainer: {
    paddingBottom: spacing.lg,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 20,
    padding: spacing.sm,
    maxHeight: 100,
    marginBottom: Platform.OS === 'ios' ? spacing.xs : 0,
    color: themes[theme].text?.primary,
    backgroundColor: themes[theme].background?.elevated,
  },
  sendButton: {
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaButton: {
    padding: spacing.xs,
  },
  previewImage: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: spacing.xs,
    marginRight: spacing.sm,
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  mediaPreview: {
    width: '100%',
    height: spacing.xxxl * 5,
    borderRadius: spacing.xs,
  },
  removeMediaButton: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.xxs,
    backgroundColor: colors.neutral[900],
    borderRadius: spacing.sm,
    padding: spacing.xxs,
},
});