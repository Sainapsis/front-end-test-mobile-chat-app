import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, FlatList, Pressable, TextInput, View, Platform, KeyboardAvoidingView, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Avatar } from '@/components/Avatar';
import { MessageBubble } from '@/components/MessageBubble';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { setStatusBarHidden } from 'expo-status-bar';

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

// Componente de indicador de carga memoizado
const LoadingIndicator = React.memo(() => (
  <View style={styles.loadingMoreContainer}>
    <ActivityIndicator size="small" color="#007AFF" />
  </View>
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
  const initialScrollRef = useRef(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estado para la paginación estilo WhatsApp
  const [visibleMessages, setVisibleMessages] = useState<any[]>([]);
  const [messagesPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollNearTop, setIsScrollNearTop] = useState(false);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const loadAttemptRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMoreRef = useRef(false);
  const consecutiveLoadsRef = useRef(0);

  // Declarar referencias a las funciones para evitar problemas de referencia circular
  const loadMoreMessagesRef = useRef<() => void>(() => { });
  const debouncedLoadMoreRef = useRef<() => void>(() => { });

  // Memoizar los datos del chat actual
  const chat = useMemo(() => {
    return chats.find(c => c.id === chatId) || null;
  }, [chats, chatId]);

  // Memoizar todos los mensajes disponibles
  const allMessages = useMemo(() => {
    // Invertimos el orden aquí para simular WhatsApp pero con lista invertida
    // Esto permite que el FlatList maneje naturalmente la carga desde "abajo" (realmente desde arriba con inverted=true)
    const messages = [...(chat?.messages || [])].reverse();
    return messages;
  }, [chat?.messages]);

  // Cargar mensajes iniciales y cuando cambia la página (estilo WhatsApp)
  useEffect(() => {
    if (allMessages.length === 0) {
      setVisibleMessages([]);
      setAllLoaded(true);
      return;
    }

    // Calculamos la cantidad de mensajes a mostrar
    const messagesToLoad = currentPage * messagesPerPage;

    // Tomamos solo los primeros X mensajes (que son los más recientes debido a la inversión)
    // Con lista invertida, los más recientes aparecen arriba naturalmente
    const visibleItems = allMessages.slice(0, Math.min(messagesToLoad, allMessages.length));

    setVisibleMessages(visibleItems);
    setAllLoaded(messagesToLoad >= allMessages.length);

    // No necesitamos manipular el scroll - este es el beneficio de la lista invertida
  }, [allMessages, currentPage, messagesPerPage]);

  // Función para cargar más mensajes (más antiguos) cuando el usuario hace scroll arriba
  const loadMoreMessages = useCallback(() => {
    if (isLoadingMoreRef.current || allLoaded) return;

    // Marcar como cargando para evitar cargas duplicadas
    isLoadingMoreRef.current = true;
    setLoadingMore(true);

    // Guardar el intento actual
    const currentAttempt = ++loadAttemptRef.current;

    // Simulamos el tiempo de carga desde la base de datos
    setTimeout(() => {
      if (currentAttempt === loadAttemptRef.current) {
        setCurrentPage(prev => prev + 1);
        setLoadingMore(false);
        isLoadingMoreRef.current = false;

        // Solo hacer una verificación adicional si estamos en el límite pero con menor frecuencia
        if ((isScrollNearTop || atScrollEnd) && !allLoaded && consecutiveLoadsRef.current < 3) {
          requestAnimationFrame(() => {
            if (!isLoadingMoreRef.current && !allLoaded) {
              // Usar el debounce para la próxima carga
              debouncedLoadMoreRef.current();
            }
          });
        } else {
          consecutiveLoadsRef.current = 0; // Reiniciar contador si no cargamos más
        }
      }
    }, 300); // Reducido el tiempo para hacerlo más reactivo
  }, [allLoaded, isScrollNearTop, atScrollEnd]);

  // Actualizar la referencia
  useEffect(() => {
    loadMoreMessagesRef.current = loadMoreMessages;
  }, [loadMoreMessages]);

  // Función debounce para controlar las cargas durante scrolls rápidos
  const debouncedLoadMore = useCallback(() => {
    // Limpiar cualquier timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si ya estamos cargando o todo está cargado, salir
    if (loadingMore || allLoaded) return;

    // Aumentar contador de intentos consecutivos
    consecutiveLoadsRef.current += 1;

    // Si hay demasiados intentos consecutivos, imponer una pausa
    if (consecutiveLoadsRef.current > 3) {
      debounceTimerRef.current = setTimeout(() => {
        consecutiveLoadsRef.current = 0;
        if (!allLoaded && !isLoadingMoreRef.current) {
          loadMoreMessagesRef.current();
        }
      }, 1000); // Esperar 1 segundo antes de permitir más cargas
      return;
    }

    // Debounce para cargas normales
    debounceTimerRef.current = setTimeout(() => {
      if (!allLoaded && !isLoadingMoreRef.current) {
        loadMoreMessagesRef.current();
      }
    }, 300);
  }, [loadingMore, allLoaded]);

  // Actualizar la referencia
  useEffect(() => {
    debouncedLoadMoreRef.current = debouncedLoadMore;
  }, [debouncedLoadMore]);

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

  // Scroll a "arriba" (que es realmente abajo con lista invertida)
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      // En una lista invertida, scrollToTop va al mensaje más reciente
      flatListRef.current.scrollToOffset({
        offset: 0,
        animated: false
      });
    }
  }, []);

  useEffect(() => {
    // Cargar sin mostrar indicador de carga
    setIsLoading(false);

    // Para el scroll inicial, lo hacemos sin animación pero con un timeout suficiente
    const timer = setTimeout(() => {
      // Scroll al final sin animación para evitar cualquier movimiento percibido
      scrollToBottom();
    }, 300);

    return () => clearTimeout(timer);
  }, [scrollToBottom]);

  // Verificar si hay nuevos mensajes
  useEffect(() => {
    // Si la cantidad de mensajes aumentó y hay nuevos mensajes...
    if (allMessages.length > lastMessagesLength.current) {
      // Si el mensaje lo acaba de enviar el usuario actual, debemos desplazar al final
      if (messageSentRef.current) {
        setTimeout(scrollToBottom, 300);
        messageSentRef.current = false;
      }
      // Si es carga inicial, también desplazamos al final
      else if (lastMessagesLength.current === 0) {
        setTimeout(scrollToBottom, 500);
      }
    }

    // Actualizar referencia
    lastMessagesLength.current = allMessages.length;
  }, [allMessages.length, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!message.trim() || !currentUser || !chatId) return;

    // Marcar que un mensaje acaba de ser enviado por el usuario
    messageSentRef.current = true;

    sendMessage(chatId, message.trim(), currentUser.id);
    setMessage('');
  }, [message, currentUser, chatId, sendMessage]);

  // Funciones para detectar el scroll manual y controlar la carga
  const handleScrollBeginDrag = useCallback(() => {
    // Cuando el usuario comienza a hacer scroll, ya no haremos scroll automático
    initialScrollRef.current = false;

    // Reiniciar el contador de cargas consecutivas cuando el usuario interactúa
    consecutiveLoadsRef.current = 0;
  }, []);

  // Detecta cuando el usuario termina de hacer scroll
  const handleScrollEndDrag = useCallback(() => {
    // Limpieza timeout anterior si existe
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
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
  // Ajustado para mejor predicción de altura para diferentes tipos de mensaje
  const getItemLayout = useCallback((data: any, index: number) => {
    // Predecir altura basada en longitud del texto (aproximación)
    const item = data?.[index];
    let estimatedHeight = 80; // Altura por defecto

    if (item?.text) {
      // Texto más largo necesita más altura
      const textLength = item.text.length;
      if (textLength > 200) {
        estimatedHeight = 180; // Mensajes muy largos
      } else if (textLength > 100) {
        estimatedHeight = 120; // Mensajes largos
      } else if (textLength > 50) {
        estimatedHeight = 100; // Mensajes medianos
      }
    }

    return {
      length: estimatedHeight,
      offset: data.slice(0, index).reduce(
        (sum: number, item: any) => {
          // Calcular offset acumulativo basado en estimaciones previas
          let height = 80;
          if (item?.text) {
            const textLength = item.text.length;
            if (textLength > 200) height = 180;
            else if (textLength > 100) height = 120;
            else if (textLength > 50) height = 100;
          }
          return sum + height;
        }, 0),
      index,
    };
  }, []);

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

  // Mejorar la detección de scroll para ser más sensible
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { y } = event.nativeEvent.contentOffset;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;

    // Guardar la posición actual del scroll
    setLastScrollY(y);

    // Calcular si estamos cerca del tope (que en una lista invertida es cargar mensajes antiguos)
    const distanceFromTop = y;
    const isNearTop = distanceFromTop < 100;

    // Detectar si estamos al final de la lista
    const endPosition = contentHeight - layoutHeight;
    const isAtEnd = Math.abs(y - endPosition) < 20 || y >= endPosition;

    // Actualizar estados
    setIsScrollNearTop(isNearTop);
    setAtScrollEnd(isAtEnd);

    // Si estamos cerca del tope o al final y no hemos cargado todos los mensajes, usar debounce
    if ((isNearTop || isAtEnd) && !allLoaded && !isLoadingMoreRef.current) {
      debouncedLoadMoreRef.current();
    }
  }, [allLoaded]);

  if (isLoading || !currentUser) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Loading chat...</ThemedText>
      </ThemedView>
    );
  }

  if (!visibleMessages && !isLoading) {
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
        name="chat"
        options={{
          headerTitle: HeaderTitle,
          headerLeft: HeaderLeft,
        }}
      />

      {/* Contenedor para métricas con posición normal en el flujo */}
      <ThemedView style={styles.metricsContainer}>
        <PerformanceMonitor
          initiallyVisible={true}
          screenName={`chat-${chatId}`}
          itemCount={visibleMessages.length}
          itemLabel="Mensajes"
          absolutePosition={false}
        />
      </ThemedView>

      <FlatList
        ref={flatListRef}
        data={visibleMessages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        ListFooterComponent={loadingMore ? LoadingIndicator : null}

        // CAMBIO RADICAL: usamos lista invertida
        // Esto significa que los mensajes más recientes aparecen en la parte superior naturalmente
        inverted={true}
        showsVerticalScrollIndicator={true}

        // Scroll al inicio (en invertido significa al mensaje más reciente)
        onContentSizeChange={() => {
          if (initialScrollRef.current) {
            scrollToBottom();
          }
        }}

        // Scroll inicial solo la primera vez
        onLayout={() => {
          if (initialScrollRef.current) {
            scrollToBottom();
          }
        }}

        // Configuración para carga infinita con detección de scroll mejorada
        onEndReached={!allLoaded ? loadMoreMessages : undefined}
        onEndReachedThreshold={0.8} // Aumentamos drásticamente el umbral para detectar casi todo el recorrido

        // Mejorar la detección de scroll
        onScroll={handleScroll}
        scrollEventThrottle={16} // Valor nativo, aproximadamente 60fps

        // Detectar interacción manual con el scroll
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={() => {
          // Verificar después de que termine el impulso de scroll, usando debounce
          if ((isScrollNearTop || atScrollEnd) && !allLoaded && !isLoadingMoreRef.current) {
            debouncedLoadMoreRef.current();
          }
        }}

        // Optimizaciones de rendimiento
        windowSize={15} // Aumentamos para precargar más elementos
        maxToRenderPerBatch={15} // Aumentamos para renderizar más elementos a la vez
        updateCellsBatchingPeriod={50} // Reducimos para actualizar más frecuentemente
        removeClippedSubviews={false} // Desactivamos para evitar problemas de renderizado en algunos dispositivos
        initialNumToRender={15}
        getItemLayout={getItemLayout}
        ListEmptyComponent={EmptyComponent}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
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
    paddingBottom: 20,
    flexGrow: 1,
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
  loadingMoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    height: 20,
    opacity: 0.7
  },
  buttonContainer: {
    padding: 5,
    alignItems: 'center',
  },
  metricsContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
}); 