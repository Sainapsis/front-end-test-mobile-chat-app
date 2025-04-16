import React from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { Avatar } from '../Avatar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BaseModal } from './BaseModal';

interface ForwardModalProps {
    visible: boolean;
    onClose: () => void;
    chats: Array<{
        id: string;
        participants: string[];
        messages: Array<{
            text: string;
        }>;
        isGroup: boolean;
    }>;
    currentUser: {
        id: string;
    } | null;
    users: Array<{
        id: string;
        name: string;
        avatar: string;
        status: 'online' | 'offline' | 'away';
    }>;
    selectedChats: string[];
    onChatSelect: (chatId: string) => void;
    onForward: () => void;
    selectedMessagesCount: number;
}

export function ForwardModal({
    visible,
    onClose,
    chats,
    currentUser,
    users,
    selectedChats,
    onChatSelect,
    onForward,
    selectedMessagesCount,
}: ForwardModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    console.log(chats);
    
    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
        >
            <View style={[
                styles.modalHeader,
                { borderBottomColor: Colors[colorScheme].icon }
            ]}>
                <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                    Forward to
                </ThemedText>
                <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <IconSymbol name="xmark" size={20} color={Colors[colorScheme].icon} />
                </Pressable>
            </View>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const otherParticipants = item.participants
                        .filter(id => id !== currentUser?.id)
                        .map(id => users.find(user => user.id === id))
                        .filter(Boolean);

                    const chatName = otherParticipants.length === 1
                        ? otherParticipants[0]?.name
                        : `${otherParticipants[0]?.name || 'Unknown'} & ${otherParticipants.length - 1} other${otherParticipants.length > 1 ? 's' : ''}`;

                    return (
                        <Pressable
                            style={[
                                styles.chatOption,
                                selectedChats.includes(item.id) && [
                                    styles.selectedChatOption,
                                    { backgroundColor: Colors[colorScheme].tint + '20' }
                                ]
                            ]}
                            onPress={() => onChatSelect(item.id)}
                        >
                            <Avatar
                                user={otherParticipants[0]}
                                size={40}
                                showStatus={false}
                                isGroup={item.isGroup}
                            />
                            <View style={styles.chatOptionInfo}>
                                <ThemedText type="defaultSemiBold">{chatName}</ThemedText>
                                <ThemedText style={[
                                    styles.chatOptionSubtitle,
                                    { color: Colors[colorScheme].icon }
                                ]}>
                                    {item.messages.length > 0
                                        ? item.messages[item.messages.length - 1].text
                                        : 'No messages yet'}
                                </ThemedText>
                            </View>
                            {selectedChats.includes(item.id) && (
                                <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
                            )}
                        </Pressable>
                    );
                }}
            />
            <View style={[
                styles.modalActions,
                { borderTopColor: Colors[colorScheme].icon }
            ]}>
                <Pressable
                    style={[
                        styles.forwardButton,
                        selectedChats.length === 0 && styles.disabledButton,
                        { backgroundColor: "#007AFF" }
                    ]}
                    onPress={onForward}
                    disabled={selectedChats.length === 0}
                >
                    <ThemedText style={styles.forwardButtonText}>
                        Forward ({selectedMessagesCount})
                    </ThemedText>
                </Pressable>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
    },
    chatOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedChatOption: {
        borderWidth: 1,
        borderColor: '#34C759',
    },
    chatOptionInfo: {
        flex: 1,
        marginLeft: 12,
    },
    chatOptionSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    forwardButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    forwardButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
}); 