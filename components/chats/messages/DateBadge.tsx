import { ThemedBadge } from "@/components/ui/badges/ThemedBadge";
import { View, StyleSheet, ViewStyle } from "react-native";
import { formatDateLabel } from "./utils/DateFormatter";

interface ThemeBadgeProps {
    timestamp: number | string;
    style?: ViewStyle
}
export function DateBadge({ timestamp, style }: ThemeBadgeProps) {

    return (
        <View style={[styles.badgeContainer, style]}>
            <ThemedBadge text={formatDateLabel(timestamp)} type='secondary' />
        </View>
    )
}

const styles = StyleSheet.create({
    badgeContainer: {
        alignSelf: 'center',
    }
})