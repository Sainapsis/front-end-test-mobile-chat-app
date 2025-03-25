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
  ActivityIndicator
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

// Constantes para mejorar el rendimiento de la virtualización
const INITIAL_NUM_TO_RENDER = 15;
const WINDOW_SIZE = 10;
const MAX_TO_RENDER_PER_BATCH = 10;
const UPDATE_CELL_BATCH_SIZE = 10;
const VIEWABILITY_THRESHOLD = 80;

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const {
    currentUser,
    users,
    chats,
    markMessageAsRead,
    loadMoreMessages
  } = useAppContext();

  const flatListRef = useRef<FlatList<Message>>(null);
  const router = useRouter();

  // Estado para trackear si estamos cargando mensajes más antiguos
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const chat = chats.find(c => c.id === chatId);

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
  const renderItem = useCallback(({ item }: ListRenderItemInfo<Message>) => (
    <MessageBubble
      message={item}
      isCurrentUser={currentUser ? item.senderId === currentUser.id : false}
      senderName={chat?.isGroup ? users.find(u => u.id === item.senderId)?.name : undefined}
    />
  ), [currentUser, chat?.isGroup, users]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  // Mark messages as read when they appear in the viewport
  const handleViewableItemsChanged = useCallback(({
    viewableItems
  }: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => {
    if (!currentUser) return;

    viewableItems.forEach((viewToken) => {
      const message = viewToken.item as Message;
      if (
        message &&
        message.senderId !== currentUser.id &&
        message.status !== 'read' &&
        (!message.readBy || !message.readBy.some(receipt => receipt.userId === currentUser.id))
      ) {
        markMessageAsRead(message.id, currentUser.id);
      }
    });
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

  // Actualizar la función handleLoadEarlier para usar la nueva funcionalidad loadMoreMessages
  const handleLoadEarlier = useCallback(async () => {
    if (isLoadingOlder || !chat || !currentUser) return;

    setIsLoadingOlder(true);
    try {
      // Utilizar la función del contexto
      await loadMoreMessages(chat.id);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, chat, currentUser, loadMoreMessages]);

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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style="auto" />
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={styles.headerContainer}>
              {renderChatAvatar()}
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {chatName}
              </ThemedText>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron-left" size={24} color="#007AFF" />
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
        contentContainerStyle={styles.messagesContainer}
        ListEmptyComponent={renderEmptyComponent}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}

        // Propiedades para virtualización y rendimiento
        removeClippedSubviews={Platform.OS !== 'web'} // Mejora rendimiento en móviles
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        updateCellsBatchingPeriod={10}
        windowSize={WINDOW_SIZE}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        getItemLayout={getItemLayout}

        // Mostrar los mensajes en orden normal
        inverted={false}

        // Cargar mensajes más antiguos al llegar al inicio de la lista
        onEndReached={handleLoadEarlier}
        onEndReachedThreshold={0.1}

        // Indicadores de carga
        ListHeaderComponent={isLoadingOlder ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#007AFF" size="small" />
          </View>
        ) : null}

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
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 