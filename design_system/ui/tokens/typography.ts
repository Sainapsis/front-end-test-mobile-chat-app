/**
 * Typography tokens for consistent text styling across the application.
 * Includes font families, weights, sizes, line heights, and predefined text variants.
 */
export const typography = {
  /** Font families for primary and secondary text */
  families: {
    primary: 'System',
    secondary: 'System',
  },
  /** Font weights for text elements */
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
  /** Font sizes for text elements */
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  /** Line heights for text elements */
  lineHeights: {
    tight: 19.2, // Adjusted to use font size multiplier
    normal: 24, // Adjusted to use font size multiplier
    relaxed: 34, // Adjusted to use font size multiplier (16 * 1.75)
  },
  /** Predefined text variants for common text elements */
  variants: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.2,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.5,
    },
  },
};