import { useMemo, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { useOptimizedContext } from './useOptimizedContext';
import { User } from './useUser';
import { Message } from './useChats';

interface ChatRoomState {
    messages: Message[];
    participants: User[];
    otherParticipants: User[];
    chatName: string;
    isLoading: boolean;
    currentUser: User | null;
    sendMessage: (text: string) => Promise<boolean>;
}

/**
 * A specialized hook for the ChatRoom screen that optimizes rendering performance
 * by memoizing calculations and minimizing re-renders
 */
export function useChatRoom(chatId: string | undefined): ChatRoomState {
    const {
        currentUser,
        users,
        chats,
        sendMessage: contextSendMessage,
        loading
    } = useAppContext();

    // Find the chat with memoization
    const chat = useMemo(() => {
        if (!chatId) return null;
        return chats.find(c => c.id === chatId) || null;
    }, [chatId, chats]);

    // Get other participants with memoization
    const otherParticipants = useMemo(() => {
        if (!chat || !currentUser) return [];

        return chat.participants
            .filter(id => id !== currentUser.id)
            .map(id => users.find(user => user.id === id))
            .filter(Boolean) as User[];
    }, [chat, currentUser, users]);

    // Generate chat name with memoization
    const chatName = useMemo(() => {
        if (otherParticipants.length === 0) return 'Chat';
        if (otherParticipants.length === 1) return otherParticipants[0].name;

        return `${otherParticipants[0].name} & ${otherParticipants.length - 1} other${otherParticipants.length > 1 ? 's' : ''}`;
    }, [otherParticipants]);

    // All participants including current user
    const participants = useMemo(() => {
        if (!chat) return [];

        return chat.participants
            .map(id => users.find(user => user.id === id))
            .filter(Boolean) as User[];
    }, [chat, users]);

    // Memoize messages to prevent unnecessary re-renders
    const messages = useMemo(() => {
        return chat?.messages || [];
    }, [chat?.messages]);

    // Optimize send message function
    const sendMessageOptimized = useCallback((text: string): Promise<boolean> => {
        if (!text.trim() || !currentUser || !chat) {
            return Promise.resolve(false);
        }

        return contextSendMessage(chat.id, text, currentUser.id);
    }, [chat, currentUser, contextSendMessage]);

    return {
        messages,
        participants,
        otherParticipants,
        chatName,
        isLoading: loading,
        currentUser,
        sendMessage: sendMessageOptimized,
    };
} 