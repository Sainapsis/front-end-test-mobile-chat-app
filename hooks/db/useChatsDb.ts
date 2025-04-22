import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '../../database/db';
import { chats, chatParticipants, messages, users } from '../../database/schema';
import { eq, and, inArray, desc, asc } from 'drizzle-orm';

/**
 * Message Interface
 * 
 * Defines the structure of a chat message with all its properties and states.
 * 
 * @property id - Unique identifier for the message
 * @property senderId - ID of the user who sent the message
 * @property text - Content of the message
 * @property imageUrl - Optional URL for image attachments
 * @property voiceUrl - Optional URL for voice message attachments
 * @property timestamp - Unix timestamp of when the message was sent
 * @property delivery_status - Current delivery status of the message
 * @property is_read - Whether the message has been read
 * @property reactions - Optional record of user reactions to the message
 * @property is_edited - Whether the message has been edited
 * @property isForwarded - Whether the message was forwarded
 * @property isDeleted - Whether the message has been deleted
 * @property deletedFor - Array of user IDs for whom the message is deleted
 */
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
  isForwarded: boolean;
  isDeleted: boolean;
  deletedFor: string[];
}

/**
 * Chat Interface
 * 
 * Defines the structure of a chat with all its properties and related messages.
 * 
 * @property id - Unique identifier for the chat
 * @property participants - Array of user IDs participating in the chat
 * @property messages - Array of messages in the chat
 * @property lastMessage - The most recent message in the chat
 * @property isGroup - Whether the chat is a group chat
 * @property groupName - Optional name for group chats
 * @property deletedFor - Array of user IDs for whom the chat is deleted
 */
export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  deletedFor?: string[];
}

/**
 * useChatsDb Hook
 * 
 * A custom hook that provides chat-related functionality and state management.
 * This hook handles all chat operations including loading, creating, sending messages,
 * managing reactions, and handling message deletion.
 * 
 * Features:
 * - Chat loading and pagination
 * - Message sending with delivery status
 * - Reaction management
 * - Message editing and deletion
 * - Chat creation and deletion
 * - Message read status tracking
 * - Optimistic updates for better UX
 * - Error handling and loading states
 * 
 * @param currentUserId - ID of the current user
 * @returns Object containing chat state and operations
 */
export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState<Record<string, boolean>>({});
  const MESSAGES_PER_PAGE = 20;

  // Memoize chat IDs for the current user
  const userChatIds = useMemo(() => {
    return userChats.map(chat => chat.id);
  }, [userChats]);

  // Optimized loadChats function with batch queries
  const loadChats = useCallback(async () => {
    if (!currentUserId) {
      setUserChats([]);
      setLoading(false);
      return;
    }

    try {
      // Get all chat IDs where the user is a participant in a single query
      const participantRows = await db
        .select({ chatId: chatParticipants.chatId })
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, currentUserId));

      const chatIds = participantRows.map(row => row.chatId);

      if (chatIds.length === 0) {
        setUserChats([]);
        setLoading(false);
        return;
      }

      // Get all chats in a single query
      const chatData = await db
        .select()
        .from(chats)
        .where(inArray(chats.id, chatIds));

      // Get all participants for all chats in a single query
      const participantsData = await db
        .select()
        .from(chatParticipants)
        .where(inArray(chatParticipants.chatId, chatIds));

      // Get all messages for all chats in a single query, ordered by timestamp
      const messagesData = await db
        .select()
        .from(messages)
        .where(inArray(messages.chatId, chatIds))
        .orderBy(asc(messages.timestamp));

      // Process data in memory for better performance
      const loadedChats: Chat[] = chatData.map(chat => {
        const deletedFor = chat.deletedFor ? JSON.parse(chat.deletedFor) : [];
        if (deletedFor.includes(currentUserId)) {
          return null;
        }

        const chatParticipants = participantsData
          .filter(p => p.chatId === chat.id)
          .map(p => p.userId);

        const chatMessages = messagesData
          .filter(m => m.chatId === chat.id)
          .map(m => {
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
              isForwarded: m.isForwarded === 1,
              isDeleted,
              deletedFor,
            };
          });

        const lastMessage = chatMessages
          .filter(msg => !msg.isDeleted)
          .pop();

        return {
          id: chat.id,
          participants: chatParticipants,
          messages: chatMessages,
          lastMessage,
          isGroup: chat.isGroup === 1,
          groupName: chat.groupName as string | undefined,
          deletedFor: deletedFor
        };
      }).filter(Boolean) as Chat[];

      setUserChats(loadedChats);
      setError(null);
    } catch (error) {
      console.error('Error loading chats:', error);
      setError(error as Error);
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
      // If it's not a group, check if there's already a chat between the users
      if (!isGroup && participantIds.length === 2) {
        const otherUserId = participantIds.find(id => id !== currentUserId);
        if (otherUserId) {
          // Search for existing chats between these users
          const existingChats = await db.select()
            .from(chats)
            .leftJoin(chatParticipants, eq(chatParticipants.chatId, chats.id))
            .where(and(
              eq(chatParticipants.userId, currentUserId),
              eq(chats.isGroup, 0)
            ));

          // Check if there is a chat where the other user is also a participant
          for (const chat of existingChats) {
            const otherParticipant = await db.select()
              .from(chatParticipants)
              .where(eq(chatParticipants.chatId, chat.chats.id))
              .then(rows => rows.find(row => row.userId === otherUserId));

            if (otherParticipant) {
              // If the current user is in deletedFor, remove them
              const deletedFor = chat.chats.deletedFor ? JSON.parse(chat.chats.deletedFor) : [];
              if (deletedFor.includes(currentUserId)) {
                const updatedDeletedFor = deletedFor.filter((id: string) => id !== currentUserId);
                await db.update(chats)
                  .set({ deletedFor: JSON.stringify(updatedDeletedFor) })
                  .where(eq(chats.id, chat.chats.id));

                // Reload all chats
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

  // Optimized sendMessage function with optimistic updates
  const sendMessage = useCallback(async (chatId: string, text: string, senderId: string, imageUrl?: string, voiceUrl?: string, isForwarded: boolean = false) => {
    if (!text.trim() && !imageUrl && !voiceUrl) return false;

    const messageId = `msg${Date.now()}`;
    const timestamp = Date.now();

    try {
      // Optimistic update
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
        isForwarded: isForwarded,
        isDeleted: false,
        deletedFor: [],
      };

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

      // Insert message in database
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
        isEdited: 0,
        isForwarded: isForwarded ? 1 : 0,
        isDeleted: 0,
        deletedFor: '[]'
      });

      // Update delivery status after a delay
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
      // Revert optimistic update on error
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.filter(msg => msg.id !== messageId),
              lastMessage: chat.messages[chat.messages.length - 2] || undefined,
            };
          }
          return chat;
        });
      });
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

  const loadMoreMessages = useCallback(async (chatId: string) => {
    if (!currentUserId || loadingMore || !hasMoreMessages[chatId]) return;

    try {
      setLoadingMore(true);

      // Get the oldest message timestamp in the current chat
      const chat = userChats.find(c => c.id === chatId);
      if (!chat) return;

      const oldestMessage = chat.messages[0];
      if (!oldestMessage) return;

      // Load older messages
      const olderMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.chatId, chatId),
            eq(messages.isDeleted, 0),
            eq(messages.timestamp, oldestMessage.timestamp)
          )
        )
        .orderBy(desc(messages.timestamp))
        .limit(MESSAGES_PER_PAGE);

      if (olderMessages.length === 0) {
        setHasMoreMessages(prev => ({ ...prev, [chatId]: false }));
        return;
      }

      const processedMessages = olderMessages.map(m => {
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
          isForwarded: m.isForwarded === 1,
          isDeleted,
          deletedFor,
        };
      });

      // Update chat with older messages
      setUserChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...processedMessages, ...chat.messages],
            };
          }
          return chat;
        });
      });

      // Check if there are more messages to load
      const hasMore = olderMessages.length === MESSAGES_PER_PAGE;
      setHasMoreMessages(prev => ({ ...prev, [chatId]: hasMore }));
    } catch (error) {
      console.error('Error loading more messages:', error);
      setError(error as Error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentUserId, userChats, loadingMore, hasMoreMessages]);

  // Initialize hasMoreMessages when loading chats
  useEffect(() => {
    if (userChats.length > 0) {
      const initialHasMore = userChats.reduce((acc, chat) => {
        acc[chat.id] = chat.messages.length === MESSAGES_PER_PAGE;
        return acc;
      }, {} as Record<string, boolean>);
      setHasMoreMessages(initialHasMore);
    }
  }, [userChats]);

  const updateUserProfile = useCallback(async (userId: string, updates: { name?: string; avatar?: string }) => {
    try {
      await db.update(users)
        .set({
          ...(updates.name && { name: updates.name }),
          ...(updates.avatar && { avatar: updates.avatar }),
        })
        .where(eq(users.id, userId));

      // Update local state if it's the current user
      if (userId === currentUserId) {
        setUserChats(prevChats => {
          return prevChats.map(chat => {
            const updatedParticipants = chat.participants.map(p => 
              p === userId ? userId : p
            );
            return {
              ...chat,
              participants: updatedParticipants,
            };
          });
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }, [currentUserId]);

  /**
   * Hook Return Value
   * 
   * @property chats - Array of user's chats
   * @property createChat - Function to create a new chat
   * @property sendMessage - Function to send a message
   * @property markMessagesAsRead - Function to mark messages as read
   * @property addReaction - Function to add a reaction to a message
   * @property removeReaction - Function to remove a reaction from a message
   * @property editMessage - Function to edit a message
   * @property deleteMessage - Function to delete a message
   * @property deleteChat - Function to delete a chat
   * @property deleteAllMessages - Function to delete all messages in a chat
   * @property loadMoreMessages - Function to load older messages
   * @property loading - Loading state for initial chat load
   * @property loadingMore - Loading state for pagination
   * @property error - Error state if any operation fails
   * @property hasMoreMessages - Record indicating which chats have more messages to load
   * @property userChatIds - Array of chat IDs for the current user
   * @property updateUserProfile - Function to update user profile information
   */
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
    loadMoreMessages,
    loading,
    loadingMore,
    error,
    hasMoreMessages,
    userChatIds,
    updateUserProfile,
  };
} 