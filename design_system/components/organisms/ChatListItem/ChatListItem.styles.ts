import { StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
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
    color: colors.text.secondary,
    fontFamily: typography.families.primary,
    fontWeight: typography.weights.regular,
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
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