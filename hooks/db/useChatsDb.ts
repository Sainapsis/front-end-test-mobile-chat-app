import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages, messageReadReceipts, messageReactions } from '../../database/schema';
import { eq, inArray, desc, and, gte, lte } from 'drizzle-orm';

// Constante para el número de mensajes a cargar por página
const MESSAGES_PER_PAGE = 30;

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
  messageType: 'text' | 'image' | 'voice';
  imageUri?: string;
  imagePreviewUri?: string;
  voiceUri?: string;
  voiceDuration?: number;
  status: 'sent' | 'delivered' | 'read';
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
            messageType: m.messageType as 'text' | 'image' | 'voice',
            imageUri: m.imageUri || undefined,
            imagePreviewUri: m.imagePreviewUri || undefined,
            voiceUri: m.voiceUri || undefined,
            voiceDuration: m.voiceDuration || undefined,
            status: m.status as 'sent' | 'delivered' | 'read',
            readBy: [],  // Se cargarán más tarde si es necesario
            reactions: [], // Se cargarán más tarde si es necesario
            isEdited: m.isEdited === 1,
            editedAt: m.editedAt || undefined,
            isDeleted: m.isDeleted === 1,
          };
        }

        loadedChats.push({
          id: chatId,
          name: chatData[0].name || undefined,
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
        messageType: m.messageType as 'text' | 'image' | 'voice',
        imageUri: m.imageUri || undefined,
        imagePreviewUri: m.imagePreviewUri || undefined,
        voiceUri: m.voiceUri || undefined,
        voiceDuration: m.voiceDuration || undefined,
        status: m.status as 'sent' | 'delivered' | 'read',
        readBy: readReceiptsByMessage[m.id] || [],
        reactions: reactionsByMessage[m.id] || [],
        isEdited: m.isEdited === 1,
        editedAt: m.editedAt || undefined,
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

  // Cargar mensajes adicionales (más antiguos) para un chat
  const loadMoreMessages = useCallback(async (chatId: string) => {
    const chat = userChats.find(c => c.id === chatId);
    if (!chat || !chat.hasMoreMessages || !chat.oldestMessageTimestamp) {
      return false;
    }

    const result = await loadMessages(chatId, chat.oldestMessageTimestamp);
    if (!result) return false;

    setUserChats(prevChats => {
      return prevChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...result.messages, ...c.messages],
            hasMoreMessages: result.hasMoreMessages,
            oldestMessageTimestamp: result.oldestTimestamp
          };
        }
        return c;
      });
    });

    return true;
  }, [loadMessages, userChats]);

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
            setUserChats(prevChats => {
              return prevChats.map(c => {
                if (c.id === chat.id) {
                  return {
                    ...c,
                    messages: result.messages,
                    hasMoreMessages: result.hasMoreMessages,
                    oldestMessageTimestamp: result.oldestTimestamp
                  };
                }
                return c;
              });
            });
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

  const createChat = useCallback(async (participantIds: string[], groupName?: string) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) {
      return null;
    }

    try {
      // Determinar si es un grupo o chat individual
      const isGroup = participantIds.length > 2 || groupName !== undefined;

      // Si no es grupo, verificar si ya existe un chat entre los dos participantes
      if (!isGroup) {
        const existingChats = userChats.filter(chat => {
          const chatParticipantIds = chat.participants;
          return !chat.isGroup &&
            participantIds.length === chatParticipantIds.length &&
            participantIds.every(id => chatParticipantIds.includes(id)) &&
            chatParticipantIds.every(id => participantIds.includes(id));
        });

        if (existingChats.length > 0) {
          return existingChats[0];
        }
      }

      const chatId = `chat${Date.now()}`;

      // Insert new chat
      await db.insert(chats).values({
        id: chatId,
        name: groupName || null,
        isGroup: isGroup ? 1 : 0,
      });

      // Insert participants
      for (const userId of participantIds) {
        await db.insert(chatParticipants).values({
          id: `cp-${chatId}-${userId}`,
          chatId: chatId,
          userId: userId,
        });
      }

      const newChat: Chat = {
        id: chatId,
        name: groupName,
        isGroup,
        participants: participantIds,
        messages: [],
        hasMoreMessages: true
      };

      setUserChats(prevChats => [...prevChats, newChat]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }, [currentUserId, userChats]);

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

      // Actualizar el estado de manera eficiente
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id !== existingChat.id) return chat;

          // Crear una copia profunda sólo del mensaje que cambió
          const updatedMessages = [...chat.messages];

          // Modificar solo el mensaje específico
          if (messageIndex >= 0) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              status: 'read' as 'sent' | 'delivered' | 'read',
              readBy: [
                ...(updatedMessages[messageIndex].readBy || []),
                { userId, timestamp }
              ],
            };
          }

          // Actualizar el lastMessage si corresponde
          const updatedLastMessage =
            chat.lastMessage?.id === messageId
              ? {
                ...chat.lastMessage,
                status: 'read' as 'sent' | 'delivered' | 'read',
                readBy: [
                  ...(chat.lastMessage.readBy || []),
                  { userId, timestamp }
                ],
              }
              : chat.lastMessage;

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: updatedLastMessage,
          };
        });
      });

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }, [userChats]);

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
      let messageType: 'text' | 'image' | 'voice' = 'text';

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
      setUserChats(prevChats => {
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
      });

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

      // Actualizar el estado de manera eficiente
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id !== existingChat.id) return chat;

          // Crear una copia profunda sólo del mensaje que cambió
          const updatedMessages = [...chat.messages];

          // Modificar solo el mensaje específico
          if (messageIndex >= 0) {
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              reactions: [
                ...updatedMessages[messageIndex].reactions,
                { userId, emoji, timestamp }
              ],
            };
          }

          // Actualizar el lastMessage si corresponde
          const updatedLastMessage =
            chat.lastMessage?.id === messageId
              ? {
                ...chat.lastMessage,
                reactions: [
                  ...chat.lastMessage.reactions,
                  { userId, emoji, timestamp }
                ],
              }
              : chat.lastMessage;

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: updatedLastMessage,
          };
        });
      });

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }, [userChats]);

  const removeReaction = useCallback(async (messageId: string, userId: string, emoji: string) => {
    try {
      // Remove reaction
      await db
        .delete(messageReactions)
        .where(
          eq(messageReactions.messageId, messageId) &&
          eq(messageReactions.userId, userId) &&
          eq(messageReactions.emoji, emoji)
        );

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.userId === userId && r.emoji === emoji)
                ),
              };
            }
            return msg;
          }),
        }));
      });

      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      const timestamp = Date.now();

      // Update message
      await db
        .update(messages)
        .set({
          text: newText,
          isEdited: 1,
          editedAt: timestamp
        })
        .where(eq(messages.id, messageId));

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: newText,
                isEdited: true,
                editedAt: timestamp
              };
            }
            return msg;
          }),
          lastMessage: chat.lastMessage?.id === messageId
            ? {
              ...chat.lastMessage,
              text: newText,
              isEdited: true,
              editedAt: timestamp
            }
            : chat.lastMessage
        }));
      });

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Mark message as deleted
      await db
        .update(messages)
        .set({ isDeleted: 1 })
        .where(eq(messages.id, messageId));

      // Update state
      setUserChats(prevChats => {
        return prevChats.map(chat => ({
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                isDeleted: true
              };
            }
            return msg;
          }),
          lastMessage: chat.lastMessage?.id === messageId
            ? {
              ...chat.lastMessage,
              isDeleted: true
            }
            : chat.lastMessage
        }));
      });

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  const forwardMessage = useCallback(async (sourceMessageId: string, targetChatId: string) => {
    if (!currentUserId) return false;

    try {
      // Buscar el mensaje original
      let originalMessage: Message | undefined;
      let originalChat: Chat | undefined;

      for (const chat of userChats) {
        const message = chat.messages.find(msg => msg.id === sourceMessageId);
        if (message) {
          originalMessage = message;
          originalChat = chat;
          break;
        }
      }

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
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === targetChatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
            };
          }
          return chat;
        });
      });

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