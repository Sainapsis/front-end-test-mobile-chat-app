import { StyleSheet } from 'react-native';
import { colors, typography } from '@/design_system/ui/tokens';

/**
 * typographyStyles object provides reusable style definitions for text elements.
 * Includes styles for titles, subtitles, body text, captions, and text alignment.
 */
export const typographyStyles = StyleSheet.create({
  /** Style for title text */
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  /** Style for subtitle text */
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
  },
  /** Style for body text */
  body: {
    fontSize: typography.sizes.md,
  },
  /** Style for caption text */
  caption: {
    fontSize: typography.sizes.sm,
  },
  /** Style for center-aligned text */
  textCenter: {
    textAlign: 'center',
  },
  /** Style for left-aligned text */
  textLeft: {
    textAlign: 'left',
  },
  /** Style for right-aligned text */
  textRight: {
    textAlign: 'right',
  },
});