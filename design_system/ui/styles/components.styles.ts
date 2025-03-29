import { Platform, StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

/**
 * componentStyles object provides reusable style definitions for common UI components.
 * Includes styles for cards, inputs, buttons, avatars, and badges.
 */
export const componentStyles = StyleSheet.create({
  /** Style for card components with platform-specific shadows */
  card: {
    backgroundColor: colors.neutral[400],
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  /** Style for input fields */
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[400],
  },
  /** Style for buttons */
  button: {
    height: 48,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  /** Style for avatar components */
  avatar: {
    borderRadius: 999,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  /** Style for badge components */
  badge: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primary.lighter,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});