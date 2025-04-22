/**
 * ForwardModal Component
 * 
 * A modal for forwarding messages that:
 * - Displays a list of available chats
 * - Allows selection of multiple chats
 * - Shows chat preview information
 * - Handles message forwarding
 * - Integrates with the app's theme system
 * 
 * This modal is used when users want to forward messages
 * to other conversations.
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, FlatList, Pressable, Modal, Animated } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { Avatar } from '../Avatar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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

export default function ForwardModal({
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
    const modalAnim = useRef(new Animated.Value(0)).current;
    const contentAnim = useRef(new Animated.Value(0)).current;

    /**
     * Handles modal animation
     * - Animates modal overlay and content
     * - Runs when modal visibility changes
     */
    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(modalAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(contentAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(modalAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(contentAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[
                styles.modalOverlay,
                {
                    opacity: modalAnim,
                    backgroundColor: `rgba(0, 0, 0, ${modalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.7]
                    })})`
                }
            ]}>
                <Animated.View style={[
                    styles.modalContent,
                    {
                        transform: [
                            {
                                translateY: contentAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [50, 0]
                                })
                            }
                        ],
                        backgroundColor: Colors[colorScheme].background,
                        borderColor: Colors[colorScheme].border,
                        borderWidth: 1,
                    }
                ]}>
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
                                            //styles.selectedChatOption,
                                            { backgroundColor: 'rgba(73, 108, 185, 0.2)' }
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
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

/**
 * Styles for the ForwardModal component
 * 
 * The styles define:
 * - Modal header layout and appearance
 * - Chat option list styling
 * - Selected chat highlighting
 * - Forward button styling
 * - Consistent spacing and margins
 */
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
}); 