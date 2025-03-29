import { Platform, StyleSheet } from 'react-native';
import { colors, spacing } from '@/design_system/ui/tokens';

export const componentStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.paper,
  },
  button: {
    height: 48,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    borderRadius: 999,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.primary[500],
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});