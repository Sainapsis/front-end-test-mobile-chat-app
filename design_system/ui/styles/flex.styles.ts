import { StyleSheet } from 'react-native';

/**
 * flexStyles object provides reusable style definitions for common flexbox layouts.
 * Includes styles for row and column layouts with various alignment options.
 */
export const flexStyles = StyleSheet.create({
  /** Basic row layout with centered items */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  /** Row layout with centered items and content */
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Row layout with space between items */
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  /** Row layout with space around items */
  rowSpaceAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  /** Basic column layout */
  column: {
    flexDirection: 'column',
  },
  /** Centered layout for both items and content */
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});