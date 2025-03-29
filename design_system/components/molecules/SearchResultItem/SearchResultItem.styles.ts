import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  resultItem: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary[700],
    marginLeft: spacing.xs,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.neutral[500],
    marginLeft: spacing.sm,
  },
});