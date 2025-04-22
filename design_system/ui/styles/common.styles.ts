import { StyleSheet } from 'react-native';
import { colors, spacing, themes } from '@/design_system/ui/tokens';

/**
 * commonStyles object provides reusable style definitions for common layout patterns.
 * Includes styles for containers, safe areas, modals, and absolute positioning.
 */
export const commonStyles = StyleSheet.create({
  /** Full-size container style */
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  /** Safe area container style */
  safeArea: {
    flex: 1,
  },
  /** Container style for gesture handling */
  gestureContainer: {
    flex: 1,
  },
  /** Modal container style with centered content */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
  },
  /** Style for absolutely positioned element that fills its parent */
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  /** Style for absolutely positioned element centered in its parent */
  absoluteCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});