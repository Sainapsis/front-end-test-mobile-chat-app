import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, radius, typography } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  } as ViewStyle,

  primary: {
    backgroundColor: colors.primary[500],
  } as ViewStyle,

  secondary: {
    backgroundColor: colors.neutral[100],
  } as ViewStyle,

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
  } as ViewStyle,

  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,

  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  } as ViewStyle,

  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  } as ViewStyle,

  fullWidth: {
    width: '100%',
  } as ViewStyle,

  disabled: {
    opacity: 0.5,
  } as ViewStyle,

  text: {
    ...typography.variants.body1,
    textAlign: 'center',
  } as TextStyle,

  primaryText: {
    color: colors.text.inverse,
  } as TextStyle,

  secondaryText: {
    color: colors.text.primary,
  } as TextStyle,

  outlineText: {
    color: colors.primary[500],
  } as TextStyle,

  ghostText: {
    color: colors.primary[500],
  } as TextStyle,

  smallText: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.normal,
  } as TextStyle,

  mediumText: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.normal,
  } as TextStyle,

  largeText: {
    fontSize: typography.sizes.lg,
  } as TextStyle,

  disabledText: {
    color: colors.text.disabled,
  } as TextStyle,

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  icon: {
    marginHorizontal: spacing.xs,
  } as ViewStyle,
});