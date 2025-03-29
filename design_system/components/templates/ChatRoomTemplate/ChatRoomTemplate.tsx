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
import { styles } from './ChatRoomTemplate.styles';

interface ChatRoomTemplateProps {
    chatName: string;
    participantAvatar?: {
        user: any;
        size: number;
    };
    messages: any[];
    messageText: string;
    isEditing: boolean;
    onBack: () => void;
    onMessageChange: (text: string) => void;
    onSendMessage: () => void;
    renderMessage: (item: any) => React.ReactNode;
    flatListRef: React.RefObject<FlatList>;
}

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
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <StatusBar style="auto" />
            <Stack.Screen
                options={{
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
                            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
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
                        color="#007AFF"
                    />
                </Pressable>
            </ThemedView>
        </KeyboardAvoidingView>
    );
};

export default ChatRoomTemplate;