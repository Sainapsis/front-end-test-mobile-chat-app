import { Pressable, TextInput, StyleSheet, Platform, useColorScheme, GestureResponderEvent, ViewStyle } from "react-native";
import { ThemedView } from "../layout/ThemedView";
import { IconSymbol } from "../icons/IconSymbol";

interface ThemedInputProps {
    messageText: string;
    setMessageText: (text: string) => void;
    handleSendMessage?: (event: GestureResponderEvent) => void;
    shouldShowButton?: boolean;
    placeholder: string;
    style?: ViewStyle;
}
export function ThemedInput({ messageText, setMessageText, handleSendMessage, shouldShowButton = false, placeholder, style}: ThemedInputProps) {
    const colorScheme = useColorScheme();
    return (
        <ThemedView style={[styles.inputContainer, { paddingBottom: Platform.OS === 'ios' ? 30 : 10 }, style]}>
            <TextInput
                style={[styles.input, { color: colorScheme === 'dark' ? '#FFF' : '#000' }]}
                value={messageText}
                onChangeText={setMessageText}
                placeholder={placeholder}
                multiline
            />
            {shouldShowButton ?
                <Pressable
                    style={[styles.sendButton, !messageText.trim() && styles.disabledButton]}
                    onPress={handleSendMessage}
                    disabled={!messageText.trim()}
                >
                    <IconSymbol name="arrow.up.circle" size={32} color="#007AFF" />
                </Pressable>
                : <></>
            }
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'flex-end'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#808080',
        borderRadius: 10,
        padding: 10,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 10,
        marginBottom: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
});