import { StyleSheet } from 'react-native';
import { themes, spacing } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes[theme].background?.main,
    paddingTop: spacing.xxxl,
  },
});