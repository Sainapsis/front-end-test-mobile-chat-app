import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    FlatList,
    TextInput,
    Pressable,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { Avatar } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles as createStyles } from './ChatRoomTemplate.styles';
import { useTheme } from '@/context/ThemeContext';
import { colors, themes } from '@/design_system/ui/tokens';

interface ChatRoomTemplateProps {
    /** Name of the chat room */
    chatName: string;
    /** Avatar of the chat participant */
    participantAvatar?: {
        user: any;
        size: number;
    };
    /** Array of messages in the chat */
    messages: any[];
    /** Current message text in the input field */
    messageText: string;
    /** Whether the user is editing a message */
    isEditing: boolean;
    /** Function to be called when navigating back */
    onBack: () => void;
    /** Function to be called when the message text changes */
    onMessageChange: (text: string) => void;
    /** Function to be called when sending a message */
    onSendMessage: () => void;
    /** Function to render each message */
    renderMessage: (item: any) => React.ReactNode;
    /** Reference to the FlatList component */
    flatListRef: React.RefObject<FlatList>;
}

/**
 * ChatRoomTemplate component provides a complete layout for a chat room interface.
 * It includes a header with participant info, a message list, and an input area.
 * Supports keyboard avoidance and theme-based styling.
 */
export const ChatRoomTemplate: React.FC<ChatRoomTemplateProps> = ({
    chatName,
    participantAvatar,
    messages,
    messageText,
    isEditing,
    onBack,
    onMessageChange,
    onSendMessage,
    renderMessage,
    flatListRef,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <StatusBar style="auto" />
            <Stack.Screen
                options={{
                    headerStyle: {
                        backgroundColor: theme === 'light' ? themes.light.background.main : themes.dark.background.main,
                    },
                    headerTintColor: theme === 'light' ? themes.light.text.contrast : themes.dark.text.contrast,

                    headerTitle: () => (
                        <View style={styles.headerContainer}>
                            {participantAvatar && (
                                <Avatar
                                    user={participantAvatar.user}
                                    size={participantAvatar.size}
                                    showStatus={false}
                                />
                            )}
                            <ThemedText type="defaultSemiBold" numberOfLines={1}>
                                {chatName}
                            </ThemedText>
                        </View>
                    ),
                    headerLeft: () => (
                        <Pressable onPress={onBack}>
                            <IconSymbol name="chevron.left" size={24} color={theme === 'light' ? themes.light.text.black : colors.neutral[100]} />
                        </Pressable>
                    ),
                }}
            />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: any }) => renderMessage(item) as React.ReactElement}
                contentContainerStyle={styles.messagesContainer}
                ListEmptyComponent={() => (
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText>No messages yet. Say hello!</ThemedText>
                    </ThemedView>
                )}
            />

            <ThemedView style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={messageText}
                    onChangeText={onMessageChange}
                    placeholder="Type a message..."
                    multiline
                />
                <Pressable
                    style={[styles.sendButton, !messageText.trim() && styles.disabledButton]}
                    onPress={onSendMessage}
                    disabled={!messageText.trim()}
                >
                    <IconSymbol
                        name={isEditing ? "pencil.circle.fill" : "arrow.up.circle.fill"}
                        size={32}
                        color={theme === 'light' ? themes.light.text.black : colors.neutral[100]}
                    />
                </Pressable>
            </ThemedView>
        </KeyboardAvoidingView>
    );
};

export default ChatRoomTemplate;