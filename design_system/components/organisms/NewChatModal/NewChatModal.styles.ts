import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background.default,
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
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  disabledButton: {
    backgroundColor: colors.neutral[300],
  },
  createButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
});