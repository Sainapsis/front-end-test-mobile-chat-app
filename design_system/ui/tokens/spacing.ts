/**
 * Spacing tokens for consistent spacing values across the application.
 * Includes predefined spacing values and a utility function for dynamic spacing.
 */
export const spacing = {
  /** No spacing */
  none: 0,
  /** Extra extra small spacing */
  xxs: 2,
  /** Extra small spacing */
  xs: 4,
  /** Small spacing */
  sm: 8,
  /** Medium spacing */
  md: 12,
  /** Large spacing */
  lg: 16,
  /** Extra large spacing */
  xl: 24,
  /** Extra extra large spacing */
  xxl: 32,
  /** Extra extra extra large spacing */
  xxxl: 48,
  /** Base spacing unit */
  base: 8,
  /**
   * Utility function to calculate dynamic spacing
   * @param multiplier - Multiplier for the base spacing unit
   * @returns Calculated spacing value
   */
  getSpacing: (multiplier: number) => multiplier * 8,
};