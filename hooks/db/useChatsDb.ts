import { useState, useEffect, useCallback } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  voiceUrl?: string;
  timestamp: number;
  delivery_status: 'sending' | 'sent' | 'delivered' | 'read';
  is_read: boolean;
  reactions?: Record<string, string>;
  is_edited: boolean;
  isDeleted: boolean;
  deletedFor: string[];
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  deletedFor?: string[];
}

export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  // Función para cargar todos los chats
  const loadChats = useCallback(async () => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    try {
      // Get chat IDs where the user is a participant
      const participantRows = await db
        .select()
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, currentUserId));

      const chatIds = participantRows.map(row => row.chatId);

      if (chatIds.length === 0) {
        setUserChats([]);
        setLoading(false);
        return;
      }

      // Build the complete chat objects
      const loadedChats: Chat[] = [];

      for (const chatId of chatIds) {
        // Get the chat
        const chatData = await db
          .select()
          .from(chats)
          .where(eq(chats.id, chatId));

        if (chatData.length === 0) continue;

        const chat = chatData[0];
        
        // Verificar si el chat está eliminado para el usuario actual
        const deletedFor = chat.deletedFor ? JSON.parse(chat.deletedFor) : [];
        if (deletedFor.includes(currentUserId)) {
          continue; // Saltar este chat si está eliminado para el usuario actual
        }

        // Get participants
        const participantsData = await db
          .select()
          .from(chatParticipants)
          .where(eq(chatParticipants.chatId, chatId));

        const participantIds = participantsData.map(p => p.userId);

        // Get messages
        const messagesData = await db
          .select()
          .from(messages)
          .where(eq(messages.chatId, chatId))
          .orderBy(messages.timestamp);

        const chatMessages: Message[] = messagesData.map(m => {
          const deletedFor = m.deletedFor ? JSON.parse(m.deletedFor as string) : [];
          const isDeleted = m.isDeleted === 1 || deletedFor.includes('all') || deletedFor.includes(currentUserId);

          return {
            id: m.id as string,
            senderId: m.senderId as string,
            text: m.text as string,
            imageUrl: m.imageUrl as string | undefined,
            voiceUrl: m.voiceUrl as string | undefined,
            timestamp: m.timestamp as number,
            delivery_status: m.deliveryStatus as Message['delivery_status'],
            is_read: m.isRead === 1,
            reactions: m.reactions ? JSON.parse(m.reactions as string) : undefined,
            is_edited: m.isEdited === 1,
            isDeleted,
            deletedFor,
          };
        });

        // Determine last message (excluding deleted messages for the current user)
        const lastMessage = chatMessages
          .filter(msg => !msg.isDeleted)
          .pop();

        loadedChats.push({
          id: chatId,
          participants: participantIds,
          messages: chatMessages,
          lastMessage,
          isGroup: chat.isGroup === 1,
          groupName: chat.groupName as string | undefined,
          deletedFor: deletedFor
        });
      }

      setUserChats(loadedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const createChat = useCallback(async (participantIds: string[], isGroup: boolean, groupName?: string) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) {
      return null;
    }

    try {
      // Si no es grupo, verificar si ya existe un chat entre los usuarios
      if (!isGroup && participantIds.length === 2) {
        const otherUserId = participantIds.find(id => id !== currentUserId);
        if (otherUserId) {
          // Buscar chats existentes entre estos usuarios
          const existingChats = await db.select()
            .from(chats)
            .leftJoin(chatParticipants, eq(chatParticipants.chatId, chats.id))
            .where(and(
              eq(chatParticipants.userId, currentUserId),
              eq(chats.isGroup, 0)
            ));

          // Verificar si hay un chat donde el otro usuario también es participante
          for (const chat of existingChats) {
            const otherParticipant = await db.select()
              .from(chatParticipants)
              .where(eq(chatParticipants.chatId, chat.chats.id))
              .then(rows => rows.find(row => row.userId === otherUserId));

            if (otherParticipant) {
              // Si el usuario actual está en deletedFor, quitarlo
              const deletedFor = chat.chats.deletedFor ? JSON.parse(chat.chats.deletedFor) : [];
              if (deletedFor.includes(currentUserId)) {
                const updatedDeletedFor = deletedFor.filter((id: string) => id !== currentUserId);
                await db.update(chats)
                  .set({ deletedFor: JSON.stringify(updatedDeletedFor) })
                  .where(eq(chats.id, chat.chats.id));

                // Recargar todos los chats
                await loadChats();
                return {
                  id: chat.chats.id,
                  participants: [currentUserId, otherUserId],
                  messages: [],
                  isGroup: false,
                  deletedFor: updatedDeletedFor
                };
              }
            }
          }
        }
      }

      const chatId = `chat${Date.now()}`;

      // Insert new chat
      await db.insert(chats).values({
        id: chatId,
        isGroup: isGroup ? 1 : 0,
        groupName: isGroup ? groupName : null,
      });

      // Insert participants
      for (const userId of participantIds) {
        await db.insert(chatParticipants).values({
          id: `cp-${chatId}-${userId}`,
          chatId: chatId,
          userId: userId,
        });
      }

      // Recargar todos los chats
      await loadChats();

      const newChat: Chat = {
        id: chatId,
        participants: participantIds,
        messages: [],
        isGroup,
        groupName: isGroup ? groupName : undefined,
        deletedFor: []
      };

      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }, [currentUserId, loadChats]);

  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string, imageUrl?: string, voiceUrl?: string) => {
    if (!text.trim() && !imageUrl && !voiceUrl) return false;

    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();

      // Insert new message with initial delivery status
      await db.insert(messages).values({
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        text: text,
        imageUrl: imageUrl,
        voiceUrl: voiceUrl,
        timestamp: timestamp,
        deliveryStatus: 'sending',
        isRead: 0,
        isEdited: 0
      });

      const newMessage: Message = {
        id: messageId,
        senderId,
        text,
        imageUrl,
        voiceUrl,
        timestamp,
        delivery_status: 'sending',
        is_read: false,
        reactions: undefined,
        is_edited: false,
        isDeleted: false,
        deletedFor: [],
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

      // Simulate message delivery
      setTimeout(async () => {
        await db.update(messages)
          .set({ deliveryStatus: 'sent' })
          .where(eq(messages.id, messageId));

        setUserChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === chatId) {
              const updatedMessages = chat.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, delivery_status: 'delivered' as const }
                  : msg
              );
              return {
                ...chat,
                messages: updatedMessages,
                lastMessage: chat.lastMessage?.id === messageId
                  ? { ...chat.lastMessage, delivery_status: 'delivered' as const }
                  : chat.lastMessage,
              };
            }
            return chat;
          });
        });
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  const markMessagesAsRead = useCallback(async (chatId: string, userId: string) => {
    try {
      // Update all messages in the database that were sent by the other user
      await db.update(messages)
        .set({
          isRead: 1,
          deliveryStatus: 'read'
        })
        .where(
          and(
            eq(messages.chatId, chatId),
            eq(messages.senderId, userId)
          )
        );

      // Update the local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg => {
              if (msg.senderId === userId) {
                return {
                  ...msg,
                  is_read: true,
                  delivery_status: 'read' as const,
                };
              }
              return msg;
            });

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: chat.lastMessage?.senderId === userId
                ? {
                  ...chat.lastMessage,
                  is_read: true,
                  delivery_status: 'read' as const,
                }
                : chat.lastMessage,
            };
          }
          return chat;
        });
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  const addReaction = useCallback(async (messageId: string, userId: string, reaction: string) => {
    try {
      // Get the current message
      const messageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (messageResult.length === 0) return;

      const message = messageResult[0];
      const currentReactions = message.reactions ? JSON.parse(message.reactions as string) : {};

      // Add or update the reaction
      currentReactions[userId] = reaction;

      // Update the message in the database
      await db.update(messages)
        .set({ reactions: JSON.stringify(currentReactions) })
        .where(eq(messages.id, messageId));

      // Update the local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: currentReactions,
              };
            }
            return msg;
          });

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: chat.lastMessage?.id === messageId
              ? {
                ...chat.lastMessage,
                reactions: currentReactions,
              }
              : chat.lastMessage,
          };
        });
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, []);

  const removeReaction = useCallback(async (messageId: string, userId: string) => {
    try {
      // Get the current message
      const messageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (messageResult.length === 0) return;

      const message = messageResult[0];
      const currentReactions = message.reactions ? JSON.parse(message.reactions as string) : {};

      // Remove the user's reaction
      delete currentReactions[userId];

      // Update the message in the database
      await db.update(messages)
        .set({ reactions: JSON.stringify(currentReactions) })
        .where(eq(messages.id, messageId));

      // Update the local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: currentReactions,
              };
            }
            return msg;
          });

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: chat.lastMessage?.id === messageId
              ? {
                ...chat.lastMessage,
                reactions: currentReactions,
              }
              : chat.lastMessage,
          };
        });
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  }, []);

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    try {
      // Update the message in the database
      await db.update(messages)
        .set({ 
          text: newText,
          isEdited: 1
        })
        .where(eq(messages.id, messageId));

      // Update the local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                text: newText,
                is_edited: true
              };
            }
            return msg;
          });

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: chat.lastMessage?.id === messageId
              ? {
                ...chat.lastMessage,
                text: newText,
                is_edited: true
              }
              : chat.lastMessage,
          };
        });
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string, userId: string, deleteForEveryone: boolean = false) => {
    try {
      // Get the current message
      const messageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (messageResult.length === 0) return;

      const message = messageResult[0];
      const currentDeletedFor = message.deletedFor ? JSON.parse(message.deletedFor as string) : [];

      if (deleteForEveryone) {
        // Delete for everyone
        await db.update(messages)
          .set({ 
            isDeleted: 1,
            deletedFor: JSON.stringify(['all'])
          })
          .where(eq(messages.id, messageId));
      } else {
        // Delete only for the user
        await db.update(messages)
          .set({ 
            deletedFor: JSON.stringify([...currentDeletedFor, userId])
          })
          .where(eq(messages.id, messageId));
      }

      // Update the local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          const updatedMessages = chat.messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                isDeleted: deleteForEveryone,
                deletedFor: deleteForEveryone ? ['all'] : [...(msg.deletedFor || []), userId]
              };
            }
            return msg;
          });

          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: chat.lastMessage?.id === messageId
              ? {
                ...chat.lastMessage,
                isDeleted: deleteForEveryone,
                deletedFor: deleteForEveryone ? ['all'] : [...(chat.lastMessage.deletedFor || []), userId]
              }
              : chat.lastMessage,
          };
        });
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, []);

  const deleteAllMessages = useCallback(async (chatId: string) => {
    try {
      // Get all messages from the chat
      const messagesResult = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId));

      // Update each message to be deleted for the current user
      for (const message of messagesResult) {
        const currentDeletedFor = message.deletedFor ? JSON.parse(message.deletedFor as string) : [];
        if (!currentDeletedFor.includes(currentUserId)) {
          await db.update(messages)
            .set({ 
              deletedFor: JSON.stringify([...currentDeletedFor, currentUserId])
            })
            .where(eq(messages.id, message.id));
        }
      }

      // Update local state
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            const updatedMessages = chat.messages.map(msg => ({
              ...msg,
              deletedFor: [...(msg.deletedFor || []), currentUserId].filter(Boolean) as string[]
            }));
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: chat.lastMessage ? {
                ...chat.lastMessage,
                deletedFor: [...(chat.lastMessage.deletedFor || []), currentUserId].filter(Boolean) as string[]
              } : undefined
            };
          }
          return chat;
        });
      });
    } catch (error) {
      console.error('Error deleting all messages:', error);
    }
  }, [currentUserId]);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      // First, delete all messages for the current user
      await deleteAllMessages(chatId);

      // Then, mark the chat as deleted for the current user
      const chatResult = await db
        .select()
        .from(chats)
        .where(eq(chats.id, chatId));

      if (chatResult.length === 0) return;

      const chat = chatResult[0];
      const currentDeletedFor = chat.deletedFor ? JSON.parse(chat.deletedFor as string) : [];

      // Update chat's deletedFor in database
      await db.update(chats)
        .set({ 
          deletedFor: JSON.stringify([...currentDeletedFor, currentUserId])
        })
        .where(eq(chats.id, chatId));

      // Update local state
      setUserChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [currentUserId, deleteAllMessages]);

  return {
    chats: userChats,
    createChat,
    sendMessage,
    markMessagesAsRead,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    deleteChat,
    deleteAllMessages,
    loading,
  };
} 