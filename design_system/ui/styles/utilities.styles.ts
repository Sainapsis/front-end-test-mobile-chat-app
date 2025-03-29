import { StyleSheet } from 'react-native';
import { spacing } from '@/design_system/ui/tokens';

export const utilityStyles = StyleSheet.create({
  gap: {
    gap: spacing.md,
  },
  gapSm: {
    gap: spacing.sm,
  },
  gapLg: {
    gap: spacing.lg,
  },
  paddingSm: { padding: spacing.sm },
  paddingMd: { padding: spacing.md },
  paddingLg: { padding: spacing.lg },
  marginSm: { margin: spacing.sm },
  marginMd: { margin: spacing.md },
  marginLg: { margin: spacing.lg },
  borderRadius: {
    borderRadius: spacing.sm,
  },
  borderRadiusMd: {
    borderRadius: spacing.md,
  },
  borderRadiusLg: {
    borderRadius: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  roundedFull: {
    borderRadius: 999,
  },
  overflowHidden: { overflow: 'hidden' },
  overflowVisible: { overflow: 'visible' },
});