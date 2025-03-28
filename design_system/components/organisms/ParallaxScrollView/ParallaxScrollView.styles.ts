import { StyleSheet } from 'react-native';
import { spacing } from '@/design_system/ui/tokens';
import { HEADER_HEIGHT, parallaxAnimation } from '@/design_system/ui/animations/parallax';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: spacing.xxxl,
    gap: spacing.lg,
    overflow: 'hidden',
  },
});

export { HEADER_HEIGHT, parallaxAnimation };
