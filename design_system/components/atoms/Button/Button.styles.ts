import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { spacing, radius, typography, themes } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const createButtonStyles = (theme: Theme) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  } as ViewStyle,

  primary: {
    backgroundColor: themes[theme].button?.primary?.background,
    borderColor: themes[theme].button?.primary?.border,
  } as ViewStyle,

  secondary: {
    backgroundColor: themes[theme].button?.secondary.background,
    borderColor: themes[theme].button?.secondary.border,
  } as ViewStyle,

  outline: {
    backgroundColor: themes[theme].button?.outline.background,
    color: themes[theme].button?.outline.text,
    borderColor: themes[theme].button?.outline.border,
    borderWidth: 1,
  } as ViewStyle,

  ghost: {
    backgroundColor: themes[theme].button?.ghost.background,
    borderColor: themes[theme].button?.ghost.border,
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
    backgroundColor: themes[theme].button?.disabled.background,
    borderColor: themes[theme].button?.disabled.border,
    opacity: 0.5,
  } as ViewStyle,

  text: {
    ...typography.variants.body1,
    textAlign: 'center',
  } as TextStyle,

  primaryText: {
    color: themes[theme].button?.primary?.text,
  } as TextStyle,

  secondaryText: {
    color: themes[theme].button?.secondary.text,
  } as TextStyle,

  outlineText: {
    color: themes[theme].button?.outline.text,
  } as TextStyle,

  ghostText: {
    color: themes[theme].button?.ghost.text,
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
    color: themes[theme].button?.disabled.text,
  } as TextStyle,

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    gap: spacing.md,
  } as ViewStyle,

  icon: {
    marginHorizontal: spacing.xs,
  } as ViewStyle,
});