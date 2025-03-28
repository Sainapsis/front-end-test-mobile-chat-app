import { Pressable, TextInput, StyleSheet, Platform, useColorScheme, GestureResponderEvent, ViewStyle } from "react-native";
import { ThemedView } from "../layout/ThemedView";
import { IconSymbol } from "../icons/IconSymbol";
import { ThemedText } from "../text/ThemedText";
import { useState } from "react";
import * as Haptics from 'expo-haptics';

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
        <ThemedView style={[styles.labeledContainer, {...style}]}>
            {label ?
                <ThemedText style={styles.label}>{label}</ThemedText> : <></>
            }
            <ThemedView style={[styles.inputContainer, style]}>
                <TextInput
                    style={[styles.input, { color: colorScheme === 'dark' ? '#FFF' : '#000', padding: shouldShowButton? 10:15}, isFocused && styles.focusedInput]}
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
                        onPressOut={async () => {
                            try {
                              await Haptics.selectionAsync();
                            } catch (error) {
                              console.warn("Haptic feedback falló:", error);
                            }
                          }}
                        disabled={!textValue.trim()}
                    >
                        <IconSymbol name="arrow.up.circle.fill" size={32} color="#007AFF" />
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