import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { Chat } from '@/hooks/useChats';
import { log, monitoring, startMeasure, endMeasure } from '@/utils';

// Función auxiliar para calcular mensajes no leídos
const calculateUnreadCount = (chat: Chat, userId?: string): number => {
    if (!userId || !chat.messages.length) return 0;

    return chat.messages.filter(msg =>
        msg.senderId !== userId &&
        !msg.readBy?.some(receipt => receipt.userId === userId)
    ).length;
};

export default function ChatList() {
    const router = useRouter();
    const { chats, loading, currentUser } = useAppContext();
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);

    // Registrar métricas de carga de la lista de chats
    useEffect(() => {
        const loadMetricId = startMeasure('chat_list_load');
        log.info(`Loading chat list: count=${chats.length}, loadingState=${loading}`);

        return () => {
            const metric = endMeasure(loadMetricId);
            log.debug(`Chat list loaded in ${metric?.duration?.toFixed(2) ?? '?'}ms`);
        };
    }, []);

    // Notificar cambios en la lista de chats
    useEffect(() => {
        if (chats.length > 0) {
            log.info(`Chats updated: count=${chats.length}`);

            // Monitorear chats sin leer
            const totalUnreadCount = chats.reduce((count, chat) => {
                const chatUnreadCount = calculateUnreadCount(chat, currentUser?.id);
                return count + chatUnreadCount;
            }, 0);

            if (totalUnreadCount > 0) {
                log.debug(`User has ${totalUnreadCount} unread messages`);
            }
        }
    }, [chats, currentUser]);

    useEffect(() => {
        if (chats && currentUser) {
            try {
                const metricId = startMeasure('chat_filtering');
                const sortedChats = [...chats].sort((a, b) => {
                    return 0;
                });
                setFilteredChats(sortedChats);
                endMeasure(metricId);
            } catch (error) {
                monitoring.captureError(
                    error instanceof Error ? error : new Error(String(error)),
                    { context: 'chat_list_filtering' }
                );
            }
        }
    }, [chats, currentUser]);

    const navigateToChat = (chatId: string) => {
        try {
            log.info(`Navigating to chat: ${chatId}`);
            const metricId = startMeasure('chat_navigation');

            router.push({
                pathname: '/ChatRoom',
                params: { chatId: chatId }
            });

            endMeasure(metricId);
        } catch (error) {
            const errorId = monitoring.captureError(
                error instanceof Error ? error : new Error(String(error)),
                { context: 'chat_navigation', chatId }
            );
            log.error(`Failed to navigate to chat [errorId: ${errorId}]`);
        }
    };

    if (loading) {
        // ... existing loading code ...
    }

    if (!loading && (!chats || chats.length === 0)) {
        log.info('No chats available to display');
        // ... existing empty state code ...
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => navigateToChat(item.id)}
                    >
                        {/* ... existing render item code ... */}
                    </TouchableOpacity>
                )}
                // Eventos de scroll para métricas de rendimiento
                onScrollBeginDrag={() => startMeasure('chat_list_scroll')}
                onScrollEndDrag={() => endMeasure('chat_list_scroll')}
                refreshing={false}
                onRefresh={() => {
                    log.debug('Chat list refresh triggered');
                    // ... existing refresh logic if any ...
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    }
}); 