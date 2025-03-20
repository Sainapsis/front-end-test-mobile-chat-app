import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";
import { ThemedText } from "./ThemedText";

interface ButtonProps {
    onPress: () => void;
    buttonText: string;
    iconName: any;
}
export function ThemedButton({ onPress, buttonText, iconName }: ButtonProps) {
    {
        return (
            <Pressable style={styles.md} onPress={onPress}>
                <ThemedText style={styles.boldText} type="subtitle">{buttonText}</ThemedText>
                <IconSymbol name={iconName} size={20} color="#FFFFFF" />
            </Pressable>
        )
    }
}

const styles = StyleSheet.create({
    md: {
        flexDirection: 'row',
        backgroundColor: '#3d6ee5',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    boldText: {
        marginLeft: 10,
        color: "#FFF"
    }
})