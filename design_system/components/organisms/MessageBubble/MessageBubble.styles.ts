import { StyleSheet } from 'react-native';
import { spacing, themes, typography, radius, colors } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const getBubbleColors = (isDark: boolean, isCurrentUser: boolean) => ({
  background: isCurrentUser
    ? isDark ? colors.success.dark : colors.success.light 
    : isDark ? colors.neutral[700] : colors.neutral[300] ,
});

export const styles = (theme: Theme) => StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  selfContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    elevation: 1,
    boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
  },
  selfBubble: {
    borderBottomRightRadius: radius.xs,
  },
  otherBubble: {
    borderBottomLeftRadius: radius.xs,
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: -spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    backgroundColor: themes[theme].background?.main,
    padding: spacing.xxs,
    borderRadius: radius.full,
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionsLeft: {
    left: spacing.xs,
  },
  reactionsRight: {
    right: spacing.xs,
  },
  reaction: {
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  reactionText: {
    fontSize: typography.sizes.sm,
  },
  messageText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  selfMessageText: {
    color: themes[theme].text?.black,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xxs,
  },
  timeText: {
    fontSize: typography.sizes.xs,
    opacity: 0.7,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.light,
    justifyContent: 'flex-end',
  },
  emojiSelectorContainer: {
    backgroundColor: themes[theme].background?.main,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: 350,
    padding: spacing.md,
  },
  emojiSelectorHeader: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginBottom: spacing.sm,
  },
  imageContainer: {
      marginBottom: spacing.sm,
      borderRadius: radius.md,
      overflow: 'hidden',
      width: '100%',
      aspectRatio: 1,
  },
  messageImage: {
      width: '100%',
      height: '100%',
  },
});
