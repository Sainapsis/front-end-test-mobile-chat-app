import { StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.light,
  },
  optionsContainer: {
    position: 'absolute',
    backgroundColor: colors.background.default,
    padding: spacing.md,
    borderRadius: radius.lg,
    width: 220,
    alignItems: 'flex-start',
    elevation: 5,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: spacing.xs,
  }
});