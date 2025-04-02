import { ThemedView } from "../layout/ThemedView";
import { ThemedText } from "../text/ThemedText";
import { StyleSheet, TextStyle, useColorScheme, ViewStyle } from 'react-native'
import { Colors } from "../themes/Colors";

interface ThemedBadgeProps {
    type: 'primary' | 'secondary' ;
    text: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
}
export function ThemedBadge({ type, text, style, textStyle}: ThemedBadgeProps) {
    const colorScheme = useColorScheme();
    return (<ThemedView style={[styles.badge, type === 'primary'? styles.primary: colorScheme === "dark"? styles.secondaryDark: styles.secondaryLight , style]}>
        <ThemedText style={[styles.text, {color: type === 'primary'? '#FFF': colorScheme === "dark"? '#FFF': '#000'}, textStyle]}>{text}</ThemedText>
    </ThemedView>)
}

const styles = StyleSheet.create({
    primary: {
        backgroundColor: Colors.badges.primary
    },
    secondaryLight: {
        backgroundColor: Colors.light.badges.secondary
    },
    secondaryDark:{
        backgroundColor: Colors.dark.badges.secondary
    },
    badge:{
        borderRadius: 12,
        height: 24,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
    },
    text: {
        fontSize: 12,
        fontWeight: 600
    }
})