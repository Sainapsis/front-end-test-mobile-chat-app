import { StyleSheet } from 'react-native';
import { spacing, typography, radius, colors } from '@/design_system/ui/tokens';

export const getBubbleColors = (isDark: boolean, isCurrentUser: boolean) => ({
  background: isCurrentUser
    ? isDark ? '#235A4A' : '#DCF8C6'
    : isDark ? '#2A2C33' : '#FFFFFF',
});

export const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: radius.xs,
  },
  otherBubble: {
    borderBottomLeftRadius: radius.xs,
  },
  messageText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
  },
  selfMessageText: {
    color: colors.text.black,
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
});
