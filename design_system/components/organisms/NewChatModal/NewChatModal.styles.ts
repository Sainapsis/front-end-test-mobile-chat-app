import { StyleSheet } from 'react-native';
import { colors, spacing, themes } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: themes[theme].background?.main,
    borderRadius: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalSubtitle: {
    marginBottom: spacing.sm,
    color: colors.neutral[600],
  },
  userList: {
    maxHeight: 400,
  },
  createButton: {
    backgroundColor: themes[theme].text?.primary,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  disabledButton: {
    backgroundColor: themes[theme].text?.disabled,
  },
  createButtonText: {
    color: themes[theme].text?.contrast,
    fontWeight: 'bold',
    fontSize: 16,
  },
});