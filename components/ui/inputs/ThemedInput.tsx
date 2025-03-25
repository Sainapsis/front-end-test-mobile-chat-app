import { Pressable, TextInput, StyleSheet, Platform, useColorScheme, GestureResponderEvent, ViewStyle } from "react-native";
import { ThemedView } from "../layout/ThemedView";
import { IconSymbol } from "../icons/IconSymbol";
import { ThemedText } from "../text/ThemedText";
import { useState } from "react";

interface ThemedInputProps {
    textValue: string;
    setTextValue: (text: string) => void;
    handleSendMessage?: (event: GestureResponderEvent) => void;
    shouldShowButton?: boolean;
    placeholder: string;
    style?: ViewStyle;
    label?: string;
    textArea?: boolean;
    autoCorrect?: boolean;
    autoCapitalize?: boolean;
    isPassword?: boolean;
}
export function ThemedInput({ textValue, setTextValue, handleSendMessage, shouldShowButton = false, placeholder, style, label, textArea = true, autoCorrect = true, autoCapitalize = true, isPassword = false }: ThemedInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const colorScheme = useColorScheme();
    return (
        <ThemedView style={styles.labeledContainer}>
            {label ?
                <ThemedText style={styles.label}>{label}</ThemedText> : <></>
            }
            <ThemedView style={[styles.inputContainer, style]}>
                <TextInput
                    style={[styles.input, { color: colorScheme === 'dark' ? '#FFF' : '#000' }, isFocused && styles.focusedInput]}
                    value={textValue}
                    onChangeText={setTextValue}
                    placeholder={placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={textArea}
                    autoCorrect={autoCorrect}
                    autoCapitalize={autoCapitalize ? 'sentences' : 'none'}
                    secureTextEntry={isPassword}
                />
                {shouldShowButton ?
                    <Pressable
                        style={[styles.sendButton, !textValue.trim() && styles.disabledButton]}
                        onPress={handleSendMessage}
                        disabled={!textValue.trim()}
                    >
                        <IconSymbol name="arrow.up.circle" size={32} color="#007AFF" />
                    </Pressable>
                    : <></>
                }
            </ThemedView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    labeledContainer: {
        padding: 10,
    },
    label: {
        marginBottom: 5,
        fontWeight: 500
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#808080',
        borderRadius: 10,
        padding: 15,
        maxHeight: 100,
    },
    focusedInput: {
        borderColor: '#3d63c9',
    },
    sendButton: {
        marginLeft: 10,
        marginBottom: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
});