import { StyleSheet } from 'react-native';
import { colors, spacing, themes, radius } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay.light,
  },
  optionsContainer: {
    position: 'absolute',
    backgroundColor: themes[theme].overlay.light,
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