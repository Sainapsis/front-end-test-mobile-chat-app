import { StyleSheet } from 'react-native';
import { spacing } from '@/design_system/ui/tokens';

/**
 * utilityStyles object provides reusable style definitions for common utility classes.
 * Includes styles for spacing, borders, width, and overflow properties.
 */
export const utilityStyles = StyleSheet.create({
  /** Medium gap between elements */
  gap: {
    gap: spacing.md,
  },
  /** Small gap between elements */
  gapSm: {
    gap: spacing.sm,
  },
  /** Large gap between elements */
  gapLg: {
    gap: spacing.lg,
  },
  /** Small padding */
  paddingSm: { padding: spacing.sm },
  /** Medium padding */
  paddingMd: { padding: spacing.md },
  /** Large padding */
  paddingLg: { padding: spacing.lg },
  /** Small margin */
  marginSm: { margin: spacing.sm },
  /** Medium margin */
  marginMd: { margin: spacing.md },
  /** Large margin */
  marginLg: { margin: spacing.lg },
  /** Small border radius */
  borderRadius: {
    borderRadius: spacing.sm,
  },
  /** Medium border radius */
  borderRadiusMd: {
    borderRadius: spacing.md,
  },
  /** Large border radius */
  borderRadiusLg: {
    borderRadius: spacing.lg,
  },
  /** Full width element */
  fullWidth: {
    width: '100%',
  },
  /** Fully rounded element */
  roundedFull: {
    borderRadius: 999,
  },
  /** Hidden overflow */
  overflowHidden: { overflow: 'hidden' },
  /** Visible overflow */
  overflowVisible: { overflow: 'visible' },
});