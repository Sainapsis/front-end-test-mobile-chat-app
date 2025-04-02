import { StyleSheet } from 'react-native';
import { spacing } from '@/design_system/ui/tokens';

export const getStyles = () => ({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  content: {
    marginTop: spacing.xs,
    marginLeft: spacing.xl,
  },
  icon: (isOpen: boolean) => ({
    transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
  }),
});

export const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  content: {
    marginTop: spacing.xs,
    marginLeft: spacing.xl,
  },
});

export const getIconStyle = (isOpen: boolean) => StyleSheet.create({
  icon: {
    transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
  },
}).icon;
