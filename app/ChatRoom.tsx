import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, FlatList, Pressable, TextInput, View, Platform, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Avatar } from '@/components/Avatar';
import { MessageBubble } from '@/components/MessageBubble';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

// Componente de entrada de mensaje memoizado
const MessageInput = React.memo(({
  message,
  setMessage,
  handleSend,
  inputRef
}: {
  message: string;
  setMessage: (text: string) => void;
  handleSend: () => void;
  inputRef: React.RefObject<TextInput>;
}) => (
  <View style={styles.inputContainer}>
    <TextInput
      ref={inputRef}
      style={styles.input}
      value={message}
      onChangeText={setMessage}
      placeholder="Type a message..."
      placeholderTextColor="#8E8E93"
      multiline
    />
    <Pressable
      style={[styles.sendButton, !message.trim() && styles.disabledSendButton]}
      onPress={handleSend}
      disabled={!message.trim()}
    >
      <IconSymbol
        name="arrow.up.circle.fill"
        size={30}
        color={message.trim() ? "#007AFF" : "#CCCCCC"}
      />
    </Pressable>
  </View>
));

// Componente memoizado para botón de generación de mensajes masivos
const BulkMessageGenerator = React.memo(({ onGenerate }: { onGenerate: () => void }) => (
  <Pressable
    onPress={onGenerate}
    style={styles.bulkGeneratorButton}
  >
    <ThemedText style={styles.bulkGeneratorText}>Generar 1000 mensajes</ThemedText>
  </Pressable>
));

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const [message, setMessage] = useState('');
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  const { currentUser, users, chats, sendMessage } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [userScrolling, setUserScrolling] = useState(false);
  const lastMessagesLength = useRef(0);
  const messageSentRef = useRef(false);

  // Memoizar los datos del chat actual
  const chat = useMemo(() => {
    return chats.find(c => c.id === chatId) || null;
  }, [chats, chatId]);

  // Memoizar los mensajes
  const messages = useMemo(() => chat?.messages || [], [chat?.messages]);

  // Memoizar la información de participantes
  const otherParticipants = useMemo(() => {
    if (!chat || !currentUser) return [];
    return chat.participants
      .filter(id => id !== currentUser.id)
      .map(id => users.find(user => user.id === id))
      .filter(Boolean as any);
  }, [chat, currentUser, users]);

  // Memoizar el nombre del chat
  const chatName = useMemo(() => {
    if (!otherParticipants.length) {
      return 'No participants';
    } else if (otherParticipants.length === 1) {
      return otherParticipants[0]?.name || 'Unknown';
    } else {
      return `${otherParticipants[0]?.name || 'Unknown'} & ${otherParticipants.length - 1} other${otherParticipants.length > 2 ? 's' : ''}`;
    }
  }, [otherParticipants]);

  // Función para desplazarse al final de la lista
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Verificar si el usuario ha mandado un mensaje, o si es carga inicial
  useEffect(() => {
    // Si la cantidad de mensajes aumentó y hay nuevos mensajes...
    if (messages.length > lastMessagesLength.current) {
      // Si el mensaje lo acaba de enviar el usuario actual, debemos desplazar al final
      if (messageSentRef.current) {
        setTimeout(scrollToBottom, 100);
        messageSentRef.current = false;
      }
      // Si es carga inicial, también desplazamos al final
      else if (lastMessagesLength.current === 0) {
        setTimeout(scrollToBottom, 100);
      }
    }

    // Actualizar referencia
    lastMessagesLength.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !currentUser || !chatId) return;

    // Marcar que un mensaje acaba de ser enviado por el usuario
    messageSentRef.current = true;

    sendMessage(chatId, message.trim(), currentUser.id);
    setMessage('');

    // El scroll al final ahora lo maneja el useEffect que monitorea cambios en messages
  }, [message, currentUser, chatId, sendMessage]);

  // Manejadores de scroll del usuario
  const handleScrollBeginDrag = useCallback(() => {
    setUserScrolling(true);
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    // No reseteamos inmediatamente para permitir momentum scrolling
    setTimeout(() => {
      setUserScrolling(false);
    }, 1500);
  }, []);

  // Memoize the empty component to prevent re-renders
  const EmptyComponent = useCallback(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText>No messages yet. Say hello!</ThemedText>
    </ThemedView>
  ), []);

  // Memoize the header component
  const HeaderTitle = useCallback(() => (
    <View style={styles.headerContainer}>
      <Avatar
        user={otherParticipants[0]}
        size={32}
        showStatus={false}
      />
      <ThemedText type="defaultSemiBold" numberOfLines={1}>
        {chatName}
      </ThemedText>
    </View>
  ), [otherParticipants, chatName]);

  // Memoize the back button
  const HeaderLeft = useCallback(() => (
    <Pressable onPress={() => router.back()}>
      <IconSymbol name="chevron.left" size={24} color="#007AFF" />
    </Pressable>
  ), [router]);

  // Memoize the renderItem function
  const renderMessage = useCallback(({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isCurrentUser={item.senderId === currentUser?.id}
    />
  ), [currentUser?.id]);

  // Optimize keyExtractor function
  const keyExtractor = useCallback((item: any) => item.id, []);

  // Memoizar getItemLayout para evitar recálculos
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 80,
    offset: 80 * index,
    index,
  }), []);

  // Función para generar mensajes masivos para pruebas de rendimiento
  const generateBulkMessages = useCallback(async () => {
    if (!currentUser || !chatId) return;

    // Mostrar algún tipo de feedback
    alert('Generando 1000 mensajes de prueba...');

    const messageTexts = [
      "Hola, ¿cómo estás?",
      "¿Qué tal tu día?",
      "Este es un mensaje de prueba para testing de rendimiento",
      "React Native es genial para desarrollo móvil multiplataforma",
      "La optimización de rendimiento es crucial para una buena UX",
      "Los componentes memoizados ayudan a reducir rerenderizados",
      "FlatList es eficiente para manejar grandes cantidades de datos",
      "Los mensajes largos también deberían renderizarse correctamente sin problemas",
      "El scroll debería mantenerse fluido incluso con miles de mensajes",
      "Es importante implementar técnicas de virtualización para listas grandes"
    ];

    // Alternar entre usuario actual y otro participante
    const otherUserId = otherParticipants[0]?.id || 'unknown-user';

    // Crear y enviar mensajes en lotes para no bloquear la UI
    const batchSize = 50;
    for (let batch = 0; batch < 20; batch++) {
      for (let i = 0; i < batchSize; i++) {
        const index = (batch * batchSize) + i;
        const messageText = `${messageTexts[index % messageTexts.length]} (${index + 1})`;
        const senderId = index % 2 === 0 ? currentUser.id : otherUserId;

        // Añadir pequeño delay entre envíos para evitar bloquear el hilo
        await new Promise(resolve => setTimeout(resolve, 10));

        await sendMessage(chatId, messageText, senderId);
      }

      // Pequeña pausa entre lotes para permitir actualizaciones de UI
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Desplazar al final cuando termine
    setTimeout(scrollToBottom, 500);

    alert('¡1000 mensajes generados con éxito!');
  }, [chatId, currentUser, otherParticipants, sendMessage, scrollToBottom]);

  if (isLoading || !currentUser) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Loading chat...</ThemedText>
      </ThemedView>
    );
  }

  if (!messages && !isLoading) {
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
          headerTitle: HeaderTitle,
          headerLeft: HeaderLeft,
        }}
      />

      <PerformanceMonitor
        initiallyVisible={true}
        screenName={`chat-${chatId}`}
        itemCount={messages.length}
        itemLabel="Mensajes"
      />

      <BulkMessageGenerator onGenerate={generateBulkMessages} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
        showsVerticalScrollIndicator={true}

        // Solo ejecutar scroll al final si no hay interacción de usuario
        onContentSizeChange={() => {
          if (!userScrolling && messageSentRef.current) {
            scrollToBottom();
          }
        }}

        // Solo scroll inicial
        onLayout={() => {
          if (lastMessagesLength.current === 0) {
            scrollToBottom();
          }
        }}

        // Detectar interacción manual con el scroll
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={() => {
          setTimeout(() => setUserScrolling(false), 1000);
        }}

        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        initialNumToRender={15}
        getItemLayout={getItemLayout}
        ListEmptyComponent={EmptyComponent}
      />

      <MessageInput
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        inputRef={inputRef}
      />
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
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    backgroundColor: '#F9F9F9',
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  bulkGeneratorButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  bulkGeneratorText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 