import { StyleSheet } from 'react-native';
import { typography } from '@/design_system/ui/tokens';
import { colors } from '@/design_system/ui/tokens';

export const styles = StyleSheet.create({
    default: {
        fontSize: typography.sizes.md,
        lineHeight: typography.lineHeights.normal,
        fontWeight: typography.weights.regular,
    },
    defaultSemiBold: {
        fontSize: typography.sizes.md,
        lineHeight: typography.lineHeights.normal,
        fontWeight: typography.weights.semiBold,
    },
    title: {
        fontSize: typography.sizes.xxxl,
        fontWeight: typography.weights.bold,
        lineHeight: typography.lineHeights.relaxed,
    },
    subtitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        lineHeight: typography.lineHeights.normal,
    },
    link: {
        lineHeight: typography.lineHeights.normal,
        fontSize: typography.sizes.md,
        color: colors.primary.main,
    },
});