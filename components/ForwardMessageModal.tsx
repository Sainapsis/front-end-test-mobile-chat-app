import React, { useState } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Pressable,
    ActivityIndicator
} from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Avatar } from './Avatar';
import { Chat } from '@/hooks/useChats';
import { selectionFeedback, mediumFeedback, lightFeedback, successFeedback, errorFeedback } from '@/utils';

interface ForwardMessageModalProps {
    visible: boolean;
    onClose: () => void;
    messageId: string;
    onForwardComplete: () => void;
}

export function ForwardMessageModal({
    visible,
    onClose,
    messageId,
    onForwardComplete
}: ForwardMessageModalProps) {
    const { chats, users, currentUser, forwardMessage } = useAppContext();
    const [isForwarding, setIsForwarding] = useState(false);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);

    // Filtramos los chats para excluir el chat actual donde está el mensaje
    const filteredChats = chats.filter(chat =>
        chat.messages.every(message => message.id !== messageId)
    );

    const handleForward = async () => {
        if (!selectedChat || !messageId) return;

        mediumFeedback(); // Retroalimentación háptica al reenviar mensaje
        setIsForwarding(true);
        try {
            const success = await forwardMessage(messageId, selectedChat);
            if (success) {
                successFeedback(); // Retroalimentación de éxito al reenviar
                onForwardComplete();
                onClose();
            } else {
                throw new Error('Failed to forward message');
            }
        } catch (error) {
            errorFeedback(); // Retroalimentación de error si falla
            console.error('Error forwarding message:', error);
        } finally {
            setIsForwarding(false);
        }
    };

    const handleSelectChat = (chatId: string) => {
        selectionFeedback(); // Retroalimentación háptica al seleccionar un chat
        setSelectedChat(chatId);
    };

    const handleClose = () => {
        lightFeedback(); // Retroalimentación ligera al cerrar el modal
        onClose();
    };

    const getChatName = (chat: Chat) => {
        if (!currentUser) return 'Unknown';

        const chatParticipants = chat.participants
            .filter(id => id !== currentUser.id)
            .map(id => users.find(user => user.id === id))
            .filter(Boolean);

        if (chatParticipants.length === 0) return 'Unknown';

        if (chatParticipants.length === 1) {
            return chatParticipants[0]?.name || 'Unknown';
        }

        return `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.backdrop} onPress={handleClose}>
                <Pressable style={styles.container}>
                    <ThemedView style={styles.content}>
                        <View style={styles.header}>
                            <ThemedText type="defaultSemiBold" style={styles.title}>
                                Reenviar mensaje a
                            </ThemedText>
                            <TouchableOpacity onPress={handleClose}>
                                <ThemedText style={styles.closeButton}>X</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {filteredChats.length === 0 ? (
                            <ThemedText style={styles.noChats}>
                                No hay chats disponibles para reenviar el mensaje
                            </ThemedText>
                        ) : (
                            <FlatList
                                data={filteredChats}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.chatItem,
                                            selectedChat === item.id && styles.selectedChat
                                        ]}
                                        onPress={() => handleSelectChat(item.id)}
                                    >
                                        <Avatar
                                            user={users.find(user =>
                                                user.id !== currentUser?.id &&
                                                item.participants.includes(user.id)
                                            )}
                                            size={40}
                                        />
                                        <ThemedText style={styles.chatName}>
                                            {getChatName(item)}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.cancelButton
                                ]}
                                onPress={handleClose}
                            >
                                <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.forwardButton,
                                    (!selectedChat || isForwarding) && styles.disabledButton
                                ]}
                                onPress={handleForward}
                                disabled={!selectedChat || isForwarding}
                            >
                                {isForwarding ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <ThemedText style={styles.buttonText}>Reenviar</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
    },
    closeButton: {
        fontSize: 18,
        padding: 8,
    },
    noChats: {
        textAlign: 'center',
        marginVertical: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedChat: {
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    chatName: {
        marginLeft: 12,
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 12,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#9E9E9E',
    },
    forwardButton: {
        backgroundColor: '#007AFF',
    },
    disabledButton: {
        backgroundColor: '#007AFF80',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
}); 