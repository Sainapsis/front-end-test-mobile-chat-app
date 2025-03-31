import { useState, useEffect, useCallback } from "react";
import { db } from "../../database/db";
import {
  chats,
  chatParticipants,
  messages,
  messageReactions,
} from "../../database/schema";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { Chat, Message, Reaction } from "@/utils/types";



export function useChatsDb(currentUserId: string | null) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Message[]>([]);

  // Load chats for the current user
  useEffect(() => {
    const loadChats = async () => {
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
          
        const chatIds = participantRows.map((row) => row.chatId);
        
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
          
          // Get participants
          const participantsData = await db
            .select()
            .from(chatParticipants)
            .where(eq(chatParticipants.chatId, chatId));
            
          const participantIds = participantsData.map((p) => p.userId);
          
          // Get messages
          const messagesData = await db
            .select()
            .from(messages)
            .where(eq(messages.chatId, chatId))
            .orderBy(messages.timestamp);
            
          // Get reactions for all messages
          const messageIds = messagesData.map((m) => m.id);
          const reactionsData = await db
            .select()
            .from(messageReactions)
            .where(sql`message_id IN ${messageIds}`);

          const chatMessages = messagesData.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            text: m.text || undefined,
            mediaUrl: m.mediaUrl || undefined,
            mediaType: m.mediaType || undefined,
            mediaThumbnail: m.mediaThumbnail || undefined,
            timestamp: m.timestamp,
            status: m.status as "sent" | "delivered" | "read",
            isEdited: Boolean(m.isEdited),
            editedAt: m.editedAt || undefined,
            reactions: reactionsData.filter((r) => r.messageId === m.id),
          }));
          
          // Determine last message
          const lastMessage =
            chatMessages.length > 0
            ? chatMessages[chatMessages.length - 1] 
            : undefined;
          
          loadedChats.push({
            id: chatId,
            participants: participantIds,
            messages: chatMessages,
            lastMessage,
          });
        }
        
        setUserChats(loadedChats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChats();
  }, [currentUserId]);

  const createChat = useCallback(
    async (participantIds: string[]) => {
    if (!currentUserId || !participantIds.includes(currentUserId)) {
      return null;
    }
    
    try {
      const chatId = `chat${Date.now()}`;
      
      // Insert new chat
      await db.insert(chats).values({
        id: chatId,
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
        participants: participantIds,
        messages: [],
      };
      
        setUserChats((prevChats) => [...prevChats, newChat]);
      return newChat;
    } catch (error) {
        console.error("Error creating chat:", error);
      return null;
    }
    },
    [currentUserId]
  );

  const sendMessage = useCallback(
    async (
      chatId: string,
      text: string | undefined,
      senderId: string,
      mediaUrl?: string,
      mediaType?: string,
      mediaThumbnail?: string,
      voiceUrl?: string,
      voiceDuration?: number,
      isVoiceMessage?: boolean,
    
    ) => {
      if (!text?.trim() && !mediaUrl) return false;
    
    try {
      const messageId = `msg${Date.now()}`;
      const timestamp = Date.now();

        const messageData = {
        id: messageId,
        chatId: chatId,
        senderId: senderId,
        timestamp: timestamp,
          status: "sent",
          isEdited: 0, // Inicialmente no está editado
          editedAt: null, // Inicialmente no tiene fecha de edición
        } as any;

        // Solo agregar campos si tienen valor
        if (text?.trim()) {
          messageData.text = text.trim();
        }
        if (mediaUrl) {
          messageData.mediaUrl = mediaUrl;
        }
        if (mediaType) {
          messageData.mediaType = mediaType;
        }
        if (mediaThumbnail) {
          messageData.mediaThumbnail = mediaThumbnail;
        }

        if (voiceUrl) {
          messageData.voiceUrl = voiceUrl;
        }
        if (voiceDuration) {
          messageData.voiceDuration = voiceDuration;
        }
        
        if (isVoiceMessage) {
          messageData.isVoiceMessage = isVoiceMessage;
        }

        
 console.log('messageData', messageData);
        // Insert new message
        await db.insert(messages).values(messageData);
      
      const newMessage: Message = {
        id: messageId,
        senderId,
          text: text?.trim() || undefined,
          mediaUrl: mediaUrl || undefined,
          mediaType: mediaType || undefined,
          mediaThumbnail: mediaThumbnail || undefined,
          voiceUrl: voiceUrl || undefined,
          voiceDuration: voiceDuration || undefined,
          isVoiceMessage: isVoiceMessage || undefined,
        timestamp,
          reactions: [],
          status: "sent",
          isEdited: false,
          editedAt: undefined,
      };


      
      // Update state
        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
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
        console.error("Error sending message:", error);
        return false;
      }
    },
    []
  );

  const updateMessageStatus = async (
    messageId: string,
    status: "sent" | "delivered" | "read"
  ) => {
    try {
      await db
        .update(messages)
        .set({ status })
        .where(eq(messages.id, messageId));

      setUserChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          ),
          lastMessage:
            chat.lastMessage?.id === messageId
              ? { ...chat.lastMessage, status }
              : chat.lastMessage,
        }))
      );
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const markMessagesAsRead = async (chatId: string) => {
    console.log('markMessagesAsRead', chatId, currentUserId);
    try {
      await db
        .update(messages)
        .set({ status: "read" })
        .where(
          and(
            eq(messages.chatId, chatId),
            eq(messages.status, "delivered"),
            sql`sender_id != ${currentUserId}`
          )
        );

      setUserChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.senderId !== currentUserId && msg.status === "delivered"
                    ? { ...msg, status: "read" }
                    : msg
                ),
                lastMessage:
                  chat.lastMessage?.senderId !== currentUserId &&
                  chat.lastMessage?.status === "delivered"
                    ? { ...chat.lastMessage, status: "read" }
                    : chat.lastMessage,
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const addReaction = useCallback(
    async (messageId: string, userId: string, emoji: string) => {
      try {
        const reactionId = `reaction${Date.now()}`;
        const timestamp = Date.now();

        // Insert new reaction
        await db.insert(messageReactions).values({
          id: reactionId,
          messageId,
          userId,
          emoji,
          timestamp,
        });

        const newReaction: Reaction = {
          id: reactionId,
          userId,
          emoji,
          timestamp,
        };

        // Update state
        setUserChats((prevChats) => {
          return prevChats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  reactions: [...(msg.reactions || []), newReaction],
                };
              }
              return msg;
            }),
            lastMessage:
              chat.lastMessage?.id === messageId
                ? {
                    ...chat.lastMessage,
                    reactions: [
                      ...(chat.lastMessage.reactions || []),
                      newReaction,
                    ],
                  }
                : chat.lastMessage,
          }));
        });

        return true;
      } catch (error) {
        console.error("Error adding reaction:", error);
        return false;
      }
    },
    []
  );

  const removeReaction = useCallback(async (reactionId: string) => {
    try {
      // Delete reaction
      await db
        .delete(messageReactions)
        .where(eq(messageReactions.id, reactionId));

      // Update state
      setUserChats((prevChats) => {
        return prevChats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            reactions: msg.reactions?.filter((r) => r.id !== reactionId) || [],
          })),
          lastMessage: chat.lastMessage?.reactions?.some(
            (r) => r.id === reactionId
          )
            ? {
                ...chat.lastMessage,
                reactions: chat.lastMessage.reactions.filter(
                  (r) => r.id !== reactionId
                ),
              }
            : chat.lastMessage,
        }));
      });

      return true;
    } catch (error) {
      console.error("Error removing reaction:", error);
      return false;
    }
  }, []);

  const searchMessages = useCallback(
    async (query: string, chatId?: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        let conditions = [
          like(messages.text, `%${query}%`),
          sql`text IS NOT NULL`,
        ];

        if (chatId) {
          conditions.push(eq(messages.chatId, chatId));
        } else if (currentUserId) {
          // Si no se especifica chatId, buscar en todos los chats del usuario
          const participantRows = await db
            .select()
            .from(chatParticipants)
            .where(eq(chatParticipants.userId, currentUserId));

          const chatIds = participantRows.map((row) => row.chatId);
          if (chatIds.length > 0) {
            conditions.push(sql`chat_id IN ${chatIds}`);
          }
        }

        const messagesData = await db
          .select()
          .from(messages)
          .where(and(...conditions))
          .orderBy(desc(messages.timestamp));

        // Obtener las reacciones para los mensajes encontrados
        const messageIds = messagesData.map((m) => m.id);
        const reactionsData = await db
          .select()
          .from(messageReactions)
          .where(sql`message_id IN ${messageIds}`);

        const messagesWithReactions = messagesData.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          text: m.text || undefined,
          mediaUrl: m.mediaUrl || undefined,
          mediaType: m.mediaType || undefined,
          mediaThumbnail: m.mediaThumbnail || undefined,
          timestamp: m.timestamp,
          status: m.status as "sent" | "delivered" | "read", // Aseguramos el tipo correcto
          isEdited: Boolean(m.isEdited), // Convertimos a boolean
          editedAt: m.editedAt || undefined,
          reactions: reactionsData.filter((r) => r.messageId === m.id),
        }));

        setSearchResults(messagesWithReactions);
      } catch (error) {
        console.error("Error searching messages:", error);
        setSearchResults([]);
      }
    },
    [currentUserId]
  );

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Primero eliminar todas las reacciones del mensaje
      await db
        .delete(messageReactions)
        .where(eq(messageReactions.messageId, messageId));

      // Luego eliminar el mensaje
      await db.delete(messages).where(eq(messages.id, messageId));

      // Actualizar el estado
      setUserChats((prevChats) => {
        return prevChats.map((chat) => {
          const updatedMessages = chat.messages.filter(
            (msg) => msg.id !== messageId
          );
          return {
            ...chat,
            messages: updatedMessages,
            lastMessage:
              chat.lastMessage?.id === messageId
                ? updatedMessages[updatedMessages.length - 1]
                : chat.lastMessage,
          };
        });
      });

      return true;
    } catch (error) {
      console.error("Error deleting message:", error);
      return false;
    }
  }, []);

  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!newText.trim()) return false;

      try {
        // Actualizar el mensaje en la base de datos
        await db
          .update(messages)
          .set({
            text: newText.trim(),
            isEdited: 1,
            editedAt: Date.now(),
          })
          .where(eq(messages.id, messageId));

        // Actualizar el estado
        setUserChats((prevChats) => {
          return prevChats.map((chat) => {
            const updatedMessages = chat.messages.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  text: newText.trim(),
                  isEdited: true,
                  editedAt: Date.now(),
                };
              }
              return msg;
            });

            return {
              ...chat,
              messages: updatedMessages,
              lastMessage:
                chat.lastMessage?.id === messageId
                  ? {
                      ...chat.lastMessage,
                      text: newText.trim(),
                      isEdited: true,
                      editedAt: Date.now(),
                    }
                  : chat.lastMessage,
            };
          });
        });

        return true;
      } catch (error) {
        console.error("Error editing message:", error);
        return false;
      }
    },
    []
  );

  return {
    chats: userChats,
    updateMessageStatus,
    markMessagesAsRead,
    createChat,
    sendMessage,
    addReaction,
    removeReaction,
    searchMessages,
    searchResults,
    deleteMessage,
    editMessage,
    loading,
  };
} 
