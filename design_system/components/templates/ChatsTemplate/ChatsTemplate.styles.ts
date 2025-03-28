import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[100],
  },
  listContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  skeletonItem: {
    marginBottom: spacing.md,
    borderRadius: spacing.sm,
  },
  emptyListContainer: {
    flex: 1,
  },
  deleteAction: {
    backgroundColor: colors.error.main,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  clearAllButton: {
    backgroundColor: colors.error.main,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    marginRight: spacing.sm,
  },
  clearAllText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay.dark,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background.default,
    elevation: 5,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalSubtitle: {
    marginBottom: spacing.sm,
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
  },
});