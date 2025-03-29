import { StyleSheet } from 'react-native';
import { colors, themes, typography, spacing } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: themes[theme].text?.primary,
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: 8,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.semiBold,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: themes[theme].text?.secondary,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: themes[theme].text?.secondary,
    flex: 1,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
  },
  currentUserMessage: {
    fontStyle: 'italic',
  },
});

export const getAnimatedStyle = (scaleAnim: import('react-native').Animated.Value, opacityAnim: import('react-native').Animated.Value) => ({
  transform: [{ scale: scaleAnim }],
  opacity: opacityAnim,
});