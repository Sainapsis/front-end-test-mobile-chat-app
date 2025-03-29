import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  skeletonAvatar: {
    marginBottom: spacing.md,
    borderRadius: 50,
  },
  skeletonText: {
    marginBottom: spacing.sm,
    borderRadius: spacing.xs,
  },
  profileHeader: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statusText: {
    fontSize: 16,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: spacing.sm,
    width: 100,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: spacing.xxxl,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: colors.error.main,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
  },
  logoutText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  themeButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});