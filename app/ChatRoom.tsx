import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ViewToken,
  ViewabilityConfig,
  Pressable,
  ListRenderItemInfo,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Message } from '@/hooks/useChats';
import { log, monitoring, startMeasure, endMeasure } from '@/utils';
import { Colors } from '@/constants/Colors';

// Constantes para mejorar el rendimiento de la virtualización
const INITIAL_NUM_TO_RENDER = 10;
const WINDOW_SIZE = 5;
const MAX_TO_RENDER_PER_BATCH = 5;
const UPDATE_CELL_BATCH_SIZE = 5;
const VIEWABILITY_THRESHOLD = 50;

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const {
    currentUser,
    users,
    chats,
    markMessageAsRead,
    loadMoreMessages,
    sendMessage
  } = useAppContext();

  const flatListRef = useRef<FlatList<Message>>(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Registrar la carga de la sala de chat y métricas de rendimiento
  useEffect(() => {
    const loadMetricId = startMeasure('chatroom_load');
    log.info(`Loading ChatRoom: chatId=${chatId}`);

    return () => {
      const metric = endMeasure(loadMetricId);
      log.info(`ChatRoom session ended: duration=${metric?.duration?.toFixed(2) || '?'}ms`);
    };
  }, [chatId]);

  // Estado para trackear si estamos cargando mensajes más antiguos
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const chat = useMemo(() => {
    const result = chats.find(c => c.id === chatId);
    if (result) {
      log.debug(`Chat found: ${chatId}, messages=${result.messages.length}`);
    } else {
      log.error(`Chat not found: ${chatId}`);
    }
    return result;
  }, [chats, chatId]);

  const chatParticipants = useMemo(() =>
    chat?.participants
      .filter(id => id !== currentUser?.id)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean) || []
    , [chat?.participants, currentUser?.id, users]);

  // Determinar el nombre del chat
  const chatName = useMemo(() =>
    chat?.isGroup && chat?.name
      ? chat.name
      : chatParticipants.length === 1
        ? chatParticipants[0]?.name
        : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`
    , [chat?.isGroup, chat?.name, chatParticipants]);

  // Memoizar los renderizadores de items para evitar recreaciones innecesarias
  const renderItem = useMemo(() => {
    return ({ item }: ListRenderItemInfo<Message>) => (
      <MessageBubble
        message={item}
        isCurrentUser={currentUser ? item.senderId === currentUser.id : false}
        senderName={chat?.isGroup ? users.find(u => u.id === item.senderId)?.name : undefined}
      />
    );
  }, [currentUser, chat?.isGroup, users]);

  // Asegurar que cada item tiene una clave única
  const keyExtractor = useCallback((item: Message, index: number) => {
    // Verificar si el ID existe y es único
    if (!item.id) {
      console.warn('Message without ID found:', item);
      // Fallback a un ID basado en el índice del mensaje y timestamp
      return `message-${index}-${item.timestamp || Date.now()}`;
    }

    // Añadir el índice como sufijo para garantizar unicidad absoluta
    // incluso si hubiera IDs duplicados
    return `${item.id}-pos${index}`;
  }, []);

  // Monitor de visualización de mensajes
  const handleViewableItemsChanged = useCallback(({
    viewableItems,
    changed
  }: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => {
    if (!currentUser) return;

    try {
      // Registrar mensajes visibles para análisis
      if (viewableItems.length > 0) {
        const messageIds = viewableItems.map(item => (item.item as Message).id);
        log.debug(`Messages viewed: ${messageIds.length}`);
      }

      // Marcar como leídos
      viewableItems.forEach((viewToken) => {
        const message = viewToken.item as Message;
        if (
          message &&
          message.senderId !== currentUser.id &&
          message.status !== 'read' &&
          (!message.readBy || !message.readBy.some(receipt => receipt.userId === currentUser.id))
        ) {
          markMessageAsRead(message.id, currentUser.id);
          log.debug(`Message marked as read: ${message.id}`);
        }
      });
    } catch (error) {
      monitoring.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'message_view_tracking' }
      );
    }
  }, [currentUser, markMessageAsRead]);

  const viewabilityConfig = useMemo((): ViewabilityConfig => ({
    itemVisiblePercentThreshold: VIEWABILITY_THRESHOLD,
  }), []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged: handleViewableItemsChanged }
  ]);

  const getItemLayout = useCallback((data: ArrayLike<Message> | null | undefined, index: number) => ({
    length: 80, // Altura aproximada de un mensaje
    offset: 80 * index,
    index,
  }), []);

  // Referencia a las posiciones de mensajes para mantener el scroll
  const lastPositionRef = useRef(0);
  const shouldMaintainScrollRef = useRef(false);
  const messagesLengthRef = useRef(0);

  // Efecto para mantener la posición de scroll cuando se cargan mensajes antiguos
  useEffect(() => {
    if (!chat) return;

    // Si la cantidad de mensajes ha aumentado y deberíamos mantener el scroll
    if (chat.messages.length > messagesLengthRef.current && shouldMaintainScrollRef.current) {
      // Calcular cuántos mensajes nuevos se han añadido al principio
      const newMessagesCount = chat.messages.length - messagesLengthRef.current;

      // Solo ajustar si hay nuevos mensajes añadidos al principio
      if (newMessagesCount > 0 && flatListRef.current) {
        try {
          // Mantener la posición relativa después de cargar antiguos mensajes
          setTimeout(() => {
            if (flatListRef.current) {
              // Si conocemos el alto aproximado de cada mensaje (80 según getItemLayout)
              flatListRef.current.scrollToOffset({
                offset: lastPositionRef.current + (newMessagesCount * 80),
                animated: false
              });
            }
            // Resetear el flag
            shouldMaintainScrollRef.current = false;
          }, 50);
        } catch (error) {
          console.error('Error adjusting scroll position:', error);
        }
      }
    }

    // Actualizar la referencia para la próxima comparación
    messagesLengthRef.current = chat.messages.length;
  }, [chat?.messages.length]);

  // Actualizar el manejador de scroll para guardar la posición
  const handleScroll = useCallback((event: any) => {
    // Guardar la posición actual del scroll
    lastPositionRef.current = event.nativeEvent.contentOffset.y;

    // Solo registrar eventos de scroll significativos para no saturar los logs
    if (event.nativeEvent.contentOffset.y % 300 < 10) {
      log.debug(`Chat scroll position: ${Math.round(event.nativeEvent.contentOffset.y)}`);
    }
  }, []);

  // Actualizar la función handleLoadEarlier
  const handleLoadEarlier = useCallback(async () => {
    if (isLoadingOlder || !chat || !currentUser) return;

    // Activar el flag para mantener la posición después de cargar
    shouldMaintainScrollRef.current = true;

    const metricId = startMeasure('load_earlier_messages');
    setIsLoadingOlder(true);
    log.info(`Loading earlier messages for chat: ${chatId}`);

    try {
      // Utilizar la función del contexto
      const success = await loadMoreMessages(chat.id);

      const metric = endMeasure(metricId);
      log.debug(`Earlier messages loaded in ${metric?.duration?.toFixed(2) || '?'}ms, success: ${success}`);

      // Actualizar si hemos llegado al final del historial
      setHasReachedEnd(!success || !chat.hasMoreMessages);
    } catch (error) {
      const errorId = monitoring.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'load_earlier_messages', chatId }
      );
      log.error(`Failed to load earlier messages [errorId: ${errorId}]`);
      setHasReachedEnd(true);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, chat, currentUser, loadMoreMessages, chatId]);

  // Desplazar automáticamente al último mensaje cuando se añade uno nuevo
  useEffect(() => {
    if (chat?.messages.length && flatListRef.current) {
      // Dejamos un pequeño retraso para asegurar que el layout esté completo
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [chat?.messages.length]);

  const renderChatAvatar = useCallback(() => {
    if (chat?.isGroup) {
      return (
        <View style={styles.groupAvatarContainer}>
          <IconSymbol name="people" size={24} color="#FFFFFF" />
        </View>
      );
    }

    return (
      <Avatar
        user={chatParticipants[0]}
        size={32}
        showStatus={false}
      />
    );
  }, [chat?.isGroup, chatParticipants]);

  const renderEmptyComponent = useCallback(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText>No messages yet. Say hello!</ThemedText>
    </ThemedView>
  ), []);

  // Agregar función para limpiar caché cuando se navega fuera del chat
  useEffect(() => {
    return () => {
      // Liberar recursos cuando se desmonta el componente
      if (flatListRef.current) {
        try {
          // Intentar limpiar la referencia de flatList
          flatListRef.current.scrollToOffset({ offset: 0, animated: false });
        } catch (error) {
          console.error('Error resetting flatList:', error);
        }
      }

      // Opcionalmente, limpiar caché de imágenes cuando se sale del chat
      // clearImageCache(); // Descomentar si queremos limpiar todas las imágenes
    };
  }, []);

  // Renderizar el componente de carga o el botón "Cargar más mensajes"
  const renderLoadMoreHeader = useCallback(() => {
    if (!chat || chat.messages.length === 0) return null;

    if (isLoadingOlder) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#007AFF" size="small" />
        </View>
      );
    }

    if (!hasReachedEnd && chat.hasMoreMessages) {
      return (
        <Pressable
          style={styles.loadMoreButton}
          onPress={handleLoadEarlier}
        >
          <ThemedText style={styles.loadMoreText}>Cargar mensajes anteriores</ThemedText>
        </Pressable>
      );
    }

    if (hasReachedEnd && chat.messages.length > 0) {
      return (
        <View style={styles.historyEndContainer}>
          <ThemedText style={styles.historyEndText}>Inicio de la conversación</ThemedText>
        </View>
      );
    }

    return null;
  }, [chat, isLoadingOlder, hasReachedEnd, handleLoadEarlier]);

  // Función para enviar mensajes con métricas y logging
  const handleSendMessage = useCallback(
    async (text: string, imageData?: { uri: string; previewUri: string }, voiceData?: { uri: string; duration: number }) => {
      if (!currentUser || !chat) return;

      const metricId = startMeasure('send_message');
      try {
        const msgType = imageData ? 'image' : voiceData ? 'voice' : 'text';
        log.info(`Sending ${msgType} message in chat: ${chatId}`);

        const result = await sendMessage(chatId, text, currentUser.id, imageData, voiceData);

        const metric = endMeasure(metricId);
        log.debug(`Message sent in ${metric?.duration?.toFixed(2) || '?'}ms, result: ${result}`);

        return result;
      } catch (error) {
        const errorId = monitoring.captureError(
          error instanceof Error ? error : new Error(String(error)),
          { context: 'send_message', chatId, messageType: imageData ? 'image' : (voiceData ? 'voice' : 'text') }
        );
        log.error(`Failed to send message [errorId: ${errorId}]`);
        return false;
      }
    },
    [chat, chatId, currentUser, sendMessage]
  );

  const handleGoBack = useCallback(() => {
    log.info(`Navigating back from chat: ${chatId}`);
    router.back();
  }, [router, chatId]);

  if (!chat || !currentUser) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Chat not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              {renderChatAvatar()}
              <ThemedText type="subtitle" numberOfLines={1}>
                {chatName}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={handleGoBack}>
              <IconSymbol name="chevron-left" size={24} color={theme.primary} />
            </Pressable>
          ),
        }}
      />

      <FlatList
        ref={flatListRef}
        data={chat.messages}
        extraData={[currentUser.id, users]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.messagesContainer,
          { backgroundColor: colorScheme === 'dark' ? '#181818' : '#F8F9FA' }
        ]}
        ListEmptyComponent={renderEmptyComponent}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        onScroll={handleScroll}
        scrollEventThrottle={16}

        // Propiedades para virtualización y rendimiento
        removeClippedSubviews={true}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        updateCellsBatchingPeriod={10}
        windowSize={WINDOW_SIZE}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        getItemLayout={getItemLayout}

        // Más optimizaciones
        disableVirtualization={false}
        legacyImplementation={false}

        // Mostrar los mensajes en orden normal
        inverted={false}

        // Indicadores de carga
        ListHeaderComponent={renderLoadMoreHeader}

        // Mejoras visuales al cargar
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />

      <MessageInput chatId={chat.id} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  groupAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A6FA5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButton: {
    padding: 12,
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#4A6FA5',
    fontWeight: '500',
  },
  historyEndContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  historyEndText: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
}); 