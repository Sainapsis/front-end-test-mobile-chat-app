import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { IconSymbol } from "../icons/IconSymbol";
import { ThemedText } from "../text/ThemedText";

interface ButtonProps {
    onPress: () => void;
    buttonText: string;
    iconName?: any;
    style?: ViewStyle;
    disabled?: boolean;
}
export function ThemedButton({ onPress, buttonText, iconName, style, disabled = false }: ButtonProps) {
    {
        return (
            <Pressable style={[styles.md, {...style}]} onPress={onPress} disabled={disabled}>
                <ThemedText style={styles.boldText} type="subtitle">{buttonText}</ThemedText>
                {iconName ? <IconSymbol name={iconName} size={20} color="#FFFFFF" /> : <></>}
            </Pressable>
        )
    }
}

const styles = StyleSheet.create({
    md: {
        flexDirection: 'row',
        backgroundColor: '#3d63c9',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginHorizontal: 10
    },
    boldText: {
        marginLeft: 10,
        color: "#FFF",
        fontSize: 16
    }
})