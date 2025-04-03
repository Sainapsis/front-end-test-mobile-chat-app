import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages, messageReadReceipts, messageReactions } from '../../database/schema';
import { eq, inArray, desc, and, lte } from 'drizzle-orm';

// Constante para el número de mensajes a cargar por página
const MESSAGES_PER_PAGE = 30;

export type MessageType = 'text' | 'image' | 'voice';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  messageType: MessageType;
  imageUri?: string;
  imagePreviewUri?: string;
  voiceUri?: string;
  voiceDuration?: number;
  status: MessageStatus;
  readBy?: { userId: string; timestamp: number }[];
  reactions: MessageReaction[];
  isEdited: boolean;
  editedAt?: number;
  isDeleted: boolean;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  hasMoreMessages: boolean;
  oldestMessageTimestamp?: number;
}

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingChatsRef = useRef<Set<string>>(new Set());

  // Cargar chats básicos (metadatos) sin mensajes
  const loadBasicChats = useCallback(async () => {
    if (!currentUserId) return [];

    try {
      // Obtener todos los chats donde el usuario actual es participante
      const participantData = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, currentUserId));

      const chatIds = participantData.map(p => p.chatId);
      const loadedChats: Chat[] = [];

      // Consulta en batch para chats y participantes
      const chatDataPromises = chatIds.map(chatId =>
        db.select().from(chats).where(eq(chats.id, chatId))
      );

      const participantsPromises = chatIds.map(chatId =>
        db.select().from(chatParticipants).where(eq(chatParticipants.chatId, chatId))
      );

      // Consulta en batch para el último mensaje de cada chat
      const lastMessagePromises = chatIds.map(chatId =>
        db.select().from(messages)
          .where(eq(messages.chatId, chatId))
          .orderBy(desc(messages.timestamp))
          .limit(1)
      );

      // Ejecutar todas las consultas en paralelo
      const results = await Promise.all([
        Promise.all(chatDataPromises),
        Promise.all(participantsPromises),
        Promise.all(lastMessagePromises)
      ]);

      const chatsData = results[0];
      const participantsData = results[1];
      const lastMessagesData = results[2];

      // Procesar los resultados de las consultas
      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatData = chatsData[i];
        const participantsInfo = participantsData[i];
        const lastMessageInfo = lastMessagesData[i];

        if (chatData.length === 0) continue;

        const participantIds = participantsInfo.map(p => p.userId);

        // Crear datos del último mensaje si existe
        let lastMessage: Message | undefined = undefined;
        if (lastMessageInfo.length > 0) {
          const m = lastMessageInfo[0];
          lastMessage = {
            id: m.id,
            senderId: m.senderId,
            text: m.text,
            timestamp: m.timestamp,
            messageType: m.messageType as MessageType,
            imageUri: m.imageUri ?? undefined,
            imagePreviewUri: m.imagePreviewUri ?? undefined,
            voiceUri: m.voiceUri ?? undefined,
            voiceDuration: m.voiceDuration ?? undefined,
            status: m.status as MessageStatus,
            readBy: [],  // Se cargarán más tarde si es necesario
            reactions: [], // Se cargarán más tarde si es necesario
            isEdited: m.isEdited === 1,
            editedAt: m.editedAt ?? undefined,
            isDeleted: m.isDeleted === 1,
          };
        }

        loadedChats.push({
          id: chatId,
          name: chatData[0].name ?? undefined,
          isGroup: chatData[0].isGroup === 1,
          participants: participantIds,
          messages: [], // No cargamos mensajes inicialmente
          lastMessage,
          hasMoreMessages: lastMessage !== undefined,
        });
      }

      return loadedChats;
    } catch (error) {
      console.error('Error loading basic chats:', error);
      return [];
    }
  }, [currentUserId]);

  // Cargar mensajes para un chat específico
  const loadMessages = useCallback(async (chatId: string, before?: number, limit = MESSAGES_PER_PAGE) => {
    try {
      // Si ya estamos cargando mensajes para este chat, evitar consultas duplicadas
      if (loadingChatsRef.current.has(chatId)) {
        return null;
      }

      loadingChatsRef.current.add(chatId);

      // Construir condición para cargar mensajes antes de cierto timestamp
      let whereCondition;
      if (before) {
        whereCondition = and(
          eq(messages.chatId, chatId),
          lte(messages.timestamp, before)
        );
      } else {
        whereCondition = eq(messages.chatId, chatId);
      }

      // Obtener mensajes paginados
      const messagesData = await db
        .select()
        .from(messages)
        .where(whereCondition)
        .orderBy(desc(messages.timestamp))
        .limit(limit + 1); // Pedimos uno más para saber si hay más

      const hasMoreMessages = messagesData.length > limit;
      const paginatedMessages = hasMoreMessages ? messagesData.slice(0, limit) : messagesData;

      if (paginatedMessages.length === 0) {
        loadingChatsRef.current.delete(chatId);
        return {
          messages: [],
          hasMoreMessages: false,
          oldestTimestamp: undefined
        };
      }

      // Ordenar mensajes por timestamp ascendente para la visualización (los más antiguos primero)
      paginatedMessages.sort((a, b) => a.timestamp - b.timestamp);

      // Obtener IDs de mensajes para cargar datos relacionados
      const messageIds = paginatedMessages.map(m => m.id);

      // Consultas en paralelo para recibos de lectura y reacciones
      const [readReceiptsData, reactionsData] = await Promise.all([
        db.select().from(messageReadReceipts).where(inArray(messageReadReceipts.messageId, messageIds)),
        db.select().from(messageReactions).where(inArray(messageReactions.messageId, messageIds))
      ]);

      // Procesar recibos de lectura y reacciones
      const readReceiptsByMessage = readReceiptsData.reduce((acc, receipt) => {
        if (!acc[receipt.messageId]) {
          acc[receipt.messageId] = [];
        }
        acc[receipt.messageId].push({
          userId: receipt.userId,
          timestamp: receipt.timestamp,
        });
        return acc;
      }, {} as Record<string, { userId: string; timestamp: number }[]>);

      const reactionsByMessage = reactionsData.reduce((acc, reaction) => {
        if (!acc[reaction.messageId]) {
          acc[reaction.messageId] = [];
        }
        acc[reaction.messageId].push({
          userId: reaction.userId,
          emoji: reaction.emoji,
          timestamp: reaction.timestamp,
        });
        return acc;
      }, {} as Record<string, MessageReaction[]>);

      // Mapear los mensajes con sus datos asociados
      const chatMessages = paginatedMessages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp,
        messageType: m.messageType as MessageType,
        imageUri: m.imageUri ?? undefined,
        imagePreviewUri: m.imagePreviewUri ?? undefined,
        voiceUri: m.voiceUri ?? undefined,
        voiceDuration: m.voiceDuration ?? undefined,
        status: m.status as MessageStatus,
        readBy: readReceiptsByMessage[m.id] ?? [],
        reactions: reactionsByMessage[m.id] ?? [],
        isEdited: m.isEdited === 1,
        editedAt: m.editedAt ?? undefined,
        isDeleted: m.isDeleted === 1,
      }));

      // Encontrar el timestamp más antiguo para futuras paginaciones
      const oldestTimestamp = chatMessages.length > 0
        ? chatMessages[0].timestamp
        : undefined;

      loadingChatsRef.current.delete(chatId);

      return {
        messages: chatMessages,
        hasMoreMessages,
        oldestTimestamp
      };
    } catch (error) {
      console.error(`Error loading messages for chat ${chatId}:`, error);
      loadingChatsRef.current.delete(chatId);
      return null;
    }
  }, []);

  // Función auxiliar para actualizar un chat específico
  const updateChatWithMessages = (prevChats: Chat[], chatId: string, result: {
    messages: Message[],
    hasMoreMessages: boolean,
    oldestTimestamp?: number
  }) => {
    return prevChats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: result.messages,
          hasMoreMessages: result.hasMoreMessages,
          oldestMessageTimestamp: result.oldestTimestamp
        };
      }
      return c;
    });
  };

  // Función auxiliar para cargar más mensajes antiguos en un chat
  const appendOlderMessages = (prevChats: Chat[], chatId: string, uniqueMessages: Message[], result: {
    hasMoreMessages: boolean,
    oldestTimestamp?: number
  }) => {
    return prevChats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...uniqueMessages, ...c.messages],
          hasMoreMessages: result.hasMoreMessages,
          oldestMessageTimestamp: result.oldestTimestamp
        };
      }
      return c;
    });
  };

  // Función para marcar un chat como sin más mensajes
  const markChatWithNoMoreMessages = (prevChats: Chat[], chatId: string) => {
    return prevChats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          hasMoreMessages: false
        };
      }
      return c;
    });
  };

  // Cargar inicialmente solo los metadatos de chats
  useEffect(() => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    const initializeChats = async () => {
      try {
        const initialChats = await loadBasicChats();
        setUserChats(initialChats);

        // Luego, cargar los mensajes más recientes para cada chat
        for (const chat of initialChats) {
          const result = await loadMessages(chat.id);
          if (result) {
            setUserChats(prevChats => updateChatWithMessages(prevChats, chat.id, result));
          }
        }
      } catch (error) {
        console.error('Error initializing chats:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChats();
  }, [currentUserId, loadBasicChats, loadMessages]);

  // Función para cargar más mensajes antiguos
  const loadMoreMessages = useCallback(async (chatId: string) => {
    try {
      const existingChat = userChats.find(chat => chat.id === chatId);
      if (!existingChat || !existingChat.hasMoreMessages) {
        return false;
      }

      const oldestTimestamp = existingChat.oldestMessageTimestamp || Date.now();

      // Intentar cargar más mensajes
      const result = await loadMessages(chatId, oldestTimestamp, MESSAGES_PER_PAGE);

      // Si hay un error o no hay resultados, terminar
      if (!result || result.messages.length === 0) {
        // Actualizar el estado del chat para indicar que no hay más mensajes
        setUserChats(markChatWithNoMoreMessages(userChats, chatId));
        return false;
      }

      // Verificar si hay mensajes con IDs duplicados
      const existingMessageIds = new Set(existingChat.messages.map(msg => msg.id));

      // Modificar los mensajes cargados para garantizar IDs únicos
      const uniqueMessages = result.messages.map(message => {
        // Si el ID ya existe en el chat, crear un ID único
        if (existingMessageIds.has(message.id)) {
          // Crear un nuevo ID con un prefijo único para evitar duplicados
          const newId = `unique_${Date.now()}_${message.id}`;
          return { ...message, id: newId };
        }
        return message;
      });

      // Actualizar los chats con los nuevos mensajes cargados
      setUserChats(appendOlderMessages(userChats, chatId, uniqueMessages, result));

      return true;
    } catch (error) {
      console.error('Error loading more messages:', error);
      return false;
    }
  }, [loadMessages, userChats]);

  // Función para crear un nuevo chat
  const createChat = useCallback(async (participantIds: string[], groupName?: string) => {
    try {
      // Si el usuario actual está intentando crear un chat que lo incluya a él mismo,
      // verificar esto para evitar duplicados
      if (currentUserId === null || !participantIds.includes(currentUserId)) {
        return null;
      }

      // Verificar si ya existe un chat con los mismos participantes
      const existingChat = userChats.find(chat => {
        // Solo comparar chats sin nombre (chats individuales)
        if (groupName && chat.name) return false;

        // Para chats grupales con nombre, siempre permitir crear uno nuevo
        const isGroup = participantIds.length > 2 || Boolean(groupName);
        if (isGroup !== chat.isGroup) return false;

        // Comprobar si los participantes son exactamente los mismos
        const sameParticipants =
          participantIds.length === chat.participants.length &&
          participantIds.every(id => chat.participants.includes(id));

        return sameParticipants;
      });

      if (existingChat) {
        return existingChat;
      }

      // Crear un nuevo chat en la base de datos
      const chatId = `chat-${Date.now()}`;

      // Determinar si es un chat grupal
      const isGroup = participantIds.length > 2 || Boolean(groupName);

      await db.insert(chats).values({
        id: chatId,
        name: groupName ?? null,
        isGroup: isGroup ? 1 : 0,
      });

      // Insertar participantes
      for (const userId of participantIds) {
        await db.insert(chatParticipants).values({
          id: `cp-${chatId}-${userId}`,
          chatId,
          userId,
        });
      }

      // Crear el nuevo chat para el estado
      const newChat: Chat = {
        id: chatId,
        name: groupName,
        isGroup,
        participants: participantIds,
        messages: [],
        hasMoreMessages: false,
      };

      // Actualizar el estado
      setUserChats(prevChats => [...prevChats, newChat]);

      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }, [currentUserId, userChats]);

  // Función auxiliar para actualizar un mensaje en el estado
  const updateMessageInChat = (chatId: string, messageId: string, messageUpdater: (msg: Message) => Message) => {
    return (prevChats: Chat[]) => {
      return prevChats.map(chat => {
        if (chat.id !== chatId) return chat;

        const updatedMessages = chat.messages.map(msg => {
          if (msg.id === messageId) {
            return messageUpdater(msg);
          }
          return msg;
        });

        // Actualizar el lastMessage si corresponde
        const updatedLastMessage =
          chat.lastMessage?.id === messageId
            ? messageUpdater(chat.lastMessage)
            : chat.lastMessage;

        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: updatedLastMessage,
        };
      });
    };
  };

  const markMessageAsRead = useCallback(async (messageId: string, userId: string) => {
    try {
      // Primero verificar si el mensaje ya está marcado como leído por este usuario
      const existingChat = userChats.find(chat =>
        chat.messages.some(msg => msg.id === messageId)
      );

      if (!existingChat) return false;

      const messageIndex = existingChat.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return false;

      const message = existingChat.messages[messageIndex];

      // Verificar si ya está marcado como leído por este usuario
      if (message.readBy?.some(receipt => receipt.userId === userId)) {
        return true; // Ya está marcado, no hacer nada
      }

      const receiptId = `receipt-${Date.now()}-${userId}`;
      const timestamp = Date.now();

      // Insertar recibo de lectura en la base de datos
      await db.insert(messageReadReceipts).values({
        id: receiptId,
        messageId,
        userId,
        timestamp,
      });

      // Actualizar estado del mensaje en la base de datos
      await db
        .update(messages)
        .set({ status: 'read' })
        .where(eq(messages.id, messageId));

      // Función para actualizar un mensaje con la marca de lectura
      const markAsRead = (msg: Message): Message => {
        return {
          ...msg,
          status: 'read' as MessageStatus,
          readBy: [
            ...(msg.readBy ?? []),
            { userId, timestamp }
          ],
        };
      };

      // Actualizar el estado usando la función auxiliar
      setUserChats(updateMessageInChat(existingChat.id, messageId, markAsRead));

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }, [userChats]);

  // Función para actualizar los chats tras enviar o reenviar un mensaje
  const updateChatsWithNewMessage = (chatId: string, newMessage: Message) => {
    return (prevChats: Chat[]) => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage,
          };
        }
        return chat;
      });
    };
  };

  const sendMessage = useCallback(async (
    chatId: string,
    text: string,
    senderId: string,
    imageData?: { uri: string; previewUri: string },
    voiceData?: { uri: string; duration: number }
  ) => {
    if (!text.trim() && !imageData && !voiceData) return false;

    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();
      let messageType: MessageType = 'text';

      if (imageData) {
        messageType = 'image';
      } else if (voiceData) {
        messageType = 'voice';
      }

      // Insert new message
      await db.insert(messages).values({
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text,
        timestamp: timestamp,
        messageType: messageType,
        imageUri: imageData?.uri,
        imagePreviewUri: imageData?.previewUri,
        voiceUri: voiceData?.uri,
        voiceDuration: voiceData?.duration,
        status: 'sent',
        isEdited: 0,
        isDeleted: 0,
      });

      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        timestamp,
        messageType,
        imageUri: imageData?.uri,
        imagePreviewUri: imageData?.previewUri,
        voiceUri: voiceData?.uri,
        voiceDuration: voiceData?.duration,
        status: 'sent',
        readBy: [],
        reactions: [],
        isEdited: false,
        editedAt: undefined,
        isDeleted: false,
      };

      // Update state
      setUserChats(updateChatsWithNewMessage(chatId, newMessage));

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    try {
      // Primero verificar si ya existe esta reacción
      const existingChat = userChats.find(chat =>
        chat.messages.some(msg => msg.id === messageId)
      );

      if (!existingChat) return false;

      const messageIndex = existingChat.messages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return false;

      const message = existingChat.messages[messageIndex];

      // Verificar si ya existe esta reacción
      if (message.reactions?.some(r => r.userId === userId && r.emoji === emoji)) {
        return true; // Ya existe esta reacción, no hacer nada
      }

      const reactionId = `reaction-${Date.now()}-${userId}`;
      const timestamp = Date.now();

      // Insertar reacción en la base de datos
      await db.insert(messageReactions).values({
        id: reactionId,
        messageId,
        userId,
        emoji,
        timestamp,
      });

      // Función para añadir una reacción a un mensaje
      const addReactionToMessage = (msg: Message): Message => {
        return {
          ...msg,
          reactions: [
            ...msg.reactions,
            { userId, emoji, timestamp }
          ],
        };
      };

      // Actualizar el estado usando la función auxiliar
      setUserChats(updateMessageInChat(existingChat.id, messageId, addReactionToMessage));

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }, [userChats]);

  const removeReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    try {
      // Identificar el chat que contiene el mensaje
      const existingChat = userChats.find(chat =>
        chat.messages.some(msg => msg.id === messageId)
      );

      if (!existingChat) return false;

      // Remove reaction from database
      await db
        .delete(messageReactions)
        .where(
          eq(messageReactions.messageId, messageId) &&
          eq(messageReactions.userId, userId) &&
          eq(messageReactions.emoji, emoji)
        );

      // Función para eliminar una reacción de un mensaje
      const removeReactionFromMessage = (msg: Message): Message => {
        return {
          ...msg,
          reactions: msg.reactions.filter(
            r => !(r.userId === userId && r.emoji === emoji)
          ),
        };
      };

      // Actualizar el estado usando la función auxiliar
      setUserChats(updateMessageInChat(existingChat.id, messageId, removeReactionFromMessage));

      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }, [userChats]);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      const timestamp = Date.now();

      // Identificar el chat que contiene el mensaje
      const existingChat = userChats.find(chat =>
        chat.messages.some(msg => msg.id === messageId)
      );

      if (!existingChat) return false;

      // Update message in database
      await db
        .update(messages)
        .set({
          text: newText,
          isEdited: 1,
          editedAt: timestamp
        })
        .where(eq(messages.id, messageId));

      // Función para editar el texto de un mensaje
      const updateMessageText = (msg: Message): Message => {
        return {
          ...msg,
          text: newText,
          isEdited: true,
          editedAt: timestamp
        };
      };

      // Actualizar el estado usando la función auxiliar
      setUserChats(updateMessageInChat(existingChat.id, messageId, updateMessageText));

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, [userChats]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Identificar el chat que contiene el mensaje
      const existingChat = userChats.find(chat =>
        chat.messages.some(msg => msg.id === messageId)
      );

      if (!existingChat) return false;

      // Mark message as deleted in database
      await db
        .update(messages)
        .set({ isDeleted: 1 })
        .where(eq(messages.id, messageId));

      // Función para marcar un mensaje como eliminado
      const markMessageAsDeleted = (msg: Message): Message => {
        return {
          ...msg,
          isDeleted: true
        };
      };

      // Actualizar el estado usando la función auxiliar
      setUserChats(updateMessageInChat(existingChat.id, messageId, markMessageAsDeleted));

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, [userChats]);

  const forwardMessage = useCallback(async (sourceMessageId: string, targetChatId: string) => {
    if (!currentUserId) return false;

    try {
      // Buscar el mensaje original usando encadenamiento opcional
      const originalMessage = userChats.flatMap(chat => chat.messages)
        .find(msg => msg.id === sourceMessageId);

      if (!originalMessage) {
        console.error('Message not found for forwarding');
        return false;
      }

      // Crear nuevo mensaje usando los datos del original
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();

      // Insertar mensaje reenviado
      await db.insert(messages).values({
        id: messageId,
        chatId: targetChatId,
        senderId: currentUserId,
        text: originalMessage.text,
        timestamp: timestamp,
        messageType: originalMessage.messageType,
        imageUri: originalMessage.imageUri,
        imagePreviewUri: originalMessage.imagePreviewUri,
        voiceUri: originalMessage.voiceUri,
        voiceDuration: originalMessage.voiceDuration,
        status: 'sent',
        isEdited: 0,
        isDeleted: 0,
      });

      const newMessage: Message = {
        id: messageId,
        senderId: currentUserId,
        text: originalMessage.text,
        timestamp,
        messageType: originalMessage.messageType,
        imageUri: originalMessage.imageUri,
        imagePreviewUri: originalMessage.imagePreviewUri,
        voiceUri: originalMessage.voiceUri,
        voiceDuration: originalMessage.voiceDuration,
        status: 'sent',
        readBy: [],
        reactions: [],
        isEdited: false,
        editedAt: undefined,
        isDeleted: false,
      };

      // Actualizar estado
      setUserChats(updateChatsWithNewMessage(targetChatId, newMessage));

      return true;
    } catch (error) {
      console.error('Error forwarding message:', error);
      return false;
    }
  }, [currentUserId, userChats]);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    markMessageAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    forwardMessage,
    loadMoreMessages,
    loading,
  };
} 