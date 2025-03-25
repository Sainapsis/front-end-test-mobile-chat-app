import React, { useEffect, useMemo, useState } from 'react';
import { Text, View, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { Chat } from '@/hooks/useChats';
import { log, monitoring, startMeasure, endMeasure } from '@/utils';
import Colors from '@/constants/Colors';
import { OptimizedImage } from './OptimizedImage';

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
            log.debug(`Chat list loaded in ${metric?.duration?.toFixed(2) || '?'}ms`);
        };
    }, []);

    // Notificar cambios en la lista de chats
    useEffect(() => {
        if (chats.length > 0) {
            log.info(`Chats updated: count=${chats.length}`);

            // Monitorear chats sin leer
            const unreadCount = chats.reduce((count, chat) => {
                return count + (chat.unreadCount || 0);
            }, 0);

            if (unreadCount > 0) {
                log.debug(`User has ${unreadCount} unread messages`);
            }
        }
    }, [chats]);

    useEffect(() => {
        if (chats && currentUser) {
            try {
                const metricId = startMeasure('chat_filtering');
                // ... existing filtering code ...
                setFilteredChats(
                    chats.sort((a, b) => {
                        // ... existing sorting code ...
                    })
                );
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
                pathname: '/(tabs)/chatroom/[id]',
                params: { id: chatId }
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