import { StyleSheet } from 'react-native';
import { colors, themes, spacing, typography } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

export const styles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  selectedContainer: {
    backgroundColor: themes[theme].background?.elevated,
  },
  infoContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: themes[theme].text?.secondary,
    marginTop: spacing.xs,
    fontFamily: typography.families.primary as string,
    fontWeight: typography.weights.regular,
  },
});