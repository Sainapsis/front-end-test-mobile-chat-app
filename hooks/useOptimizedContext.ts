import { useCallback, useMemo } from 'react';
import { useAppContext } from './AppContext';
import { Chat, Message } from './useChats';
import { User } from './useUser';

/**
 * A custom hook that provides optimized access to specific pieces of context state
 * This pattern prevents unnecessary re-renders when using context
 */
export function useOptimizedContext() {
    const context = useAppContext();

    // Memoize selectors
    const useCurrentUser = useCallback(() => {
        return context.currentUser;
    }, [context.currentUser]);

    const useUsers = useCallback(() => {
        return context.users;
    }, [context.users]);

    const useUserById = useCallback((userId: string) => {
        return useMemo(() => {
            return context.users.find(user => user.id === userId) || null;
        }, [userId, context.users]);
    }, [context.users]);

    const useChats = useCallback(() => {
        return context.chats;
    }, [context.chats]);

    const useChatById = useCallback((chatId: string | undefined) => {
        return useMemo(() => {
            return chatId ? context.chats.find(chat => chat.id === chatId) || null : null;
        }, [chatId, context.chats]);
    }, [context.chats]);

    const useChatParticipants = useCallback((chatId: string, excludeCurrentUser: boolean = true) => {
        return useMemo(() => {
            const chat = context.chats.find(c => c.id === chatId);
            if (!chat) return [];

            let participantIds = chat.participants;
            if (excludeCurrentUser && context.currentUser) {
                participantIds = participantIds.filter(id => id !== context.currentUser?.id);
            }

            return participantIds
                .map(id => context.users.find(user => user.id === id))
                .filter(Boolean) as User[];
        }, [chatId, context.chats, context.users, context.currentUser, excludeCurrentUser]);
    }, [context.chats, context.users, context.currentUser]);

    // Memoize actions
    const sendMessage = useCallback((chatId: string, text: string) => {
        if (!context.currentUser) return Promise.resolve(false);
        return context.sendMessage(chatId, text, context.currentUser.id);
    }, [context.sendMessage, context.currentUser]);

    const createChat = useCallback((participantIds: string[]) => {
        return context.createChat(participantIds);
    }, [context.createChat]);

    const login = useCallback((userId: string) => {
        return context.login(userId);
    }, [context.login]);

    const logout = useCallback(() => {
        context.logout();
    }, [context.logout]);

    return {
        // State selectors
        useCurrentUser,
        useUsers,
        useUserById,
        useChats,
        useChatById,
        useChatParticipants,

        // Loading state
        loading: context.loading,

        // Actions
        sendMessage,
        createChat,
        login,
        logout,
    };
} 