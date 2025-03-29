import { StyleSheet } from 'react-native';
import { colors, typography } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.text.inverse,
    fontWeight: '700',
    fontFamily: typography.families.primary,
  },
  statusIndicator: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: colors.border.default,
  },
});

export const getAvatarStyles = (
  size: number, 
  backgroundColor: string,
  status?: keyof typeof statusColors
) => ({
  avatarSize: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  },
  initialsSize: {
    fontSize: size * 0.4,
    lineHeight: size * 0.4 * 1.2,
  },
  statusSize: {
    backgroundColor: status ? statusColors[status] : statusColors.offline,
    width: size / 4,
    height: size / 4,
    borderRadius: size / 8,
    right: 0,
    bottom: 0,
  },
});

export const statusColors = {
  online: colors.success.main,
  offline: colors.neutral[400],
  away: colors.warning.main,
} as const;