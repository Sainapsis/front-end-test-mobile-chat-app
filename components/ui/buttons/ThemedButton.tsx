import { Pressable, StyleSheet, useColorScheme, ViewStyle } from "react-native";
import { IconSymbol } from "../icons/IconSymbol";
import { ThemedText } from "../text/ThemedText";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { Colors } from "../themes/Colors";

interface ButtonProps {
    onPress: () => void;
    buttonText: string;
    iconName?: any;
    style?: ViewStyle;
    disabled?: boolean;
    type?: string;
}
export function ThemedButton({ onPress, buttonText, iconName, style, disabled = false, type = "primary" }: ButtonProps) {
    const colorScheme = useColorScheme();
    {
        return (
            <Pressable style={[styles.md, { ...style }, disabled && styles.disabled, type === "primary" && styles.primary, type === "secondary" && styles.secondary]} onPress={onPress} disabled={disabled}>
                <ThemedText style={[styles.boldText, { color: type === "primary" ? Colors[colorScheme || 'light'].button.textPrimary : Colors.button.textSecondary }]} type="subtitle">{buttonText}</ThemedText>
                {iconName ? <IconSymbol name={iconName} size={20} color={type === "primary" ? Colors[colorScheme || 'light'].button.textPrimary : Colors.button.textSecondary} /> : <></>}
            </Pressable>
        )
    }
}

const styles = StyleSheet.create({
    md: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginHorizontal: 10
    },
    boldText: {
        marginLeft: 10,
        fontSize: 16
    },
    disabled: {
        opacity: 0.5
    },
    primary: {
        backgroundColor: Colors.button.background,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderColor: Colors.button.border,
        borderWidth: 2,
    }
})