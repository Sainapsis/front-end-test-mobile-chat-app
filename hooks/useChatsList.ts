import { useMemo, useCallback } from 'react';
import { useAppContext } from './AppContext';
import { User } from './useUser';
import { Chat } from './useChats';

interface ChatListItem extends Chat {
    otherParticipants: User[];
    chatName: string;
    lastMessageFormatted: {
        text: string;
        time: string;
        isCurrentUser: boolean;
    } | null;
}

interface ChatsListState {
    chats: ChatListItem[];
    isLoading: boolean;
    createChat: (participantIds: string[]) => Promise<Chat | null>;
    isEmpty: boolean;
}

/**
 * A specialized hook for the Chats list screen that optimizes rendering performance
 */
export function useChatsList(): ChatsListState {
    const { currentUser, users, chats, createChat, loading } = useAppContext();

    // Process and memoize all chat data to minimize calculations in the component
    const processedChats = useMemo(() => {
        if (!currentUser) return [];

        return chats.map(chat => {
            // Get other participants
            const otherParticipants = chat.participants
                .filter(id => id !== currentUser.id)
                .map(id => users.find(user => user.id === id))
                .filter(Boolean) as User[];

            // Generate chat name
            const chatName = otherParticipants.length === 0
                ? 'No participants'
                : otherParticipants.length === 1
                    ? otherParticipants[0].name
                    : `${otherParticipants[0].name} & ${otherParticipants.length - 1} other${otherParticipants.length > 2 ? 's' : ''}`;

            // Format last message time
            let lastMessageFormatted = null;

            if (chat.lastMessage) {
                const date = new Date(chat.lastMessage.timestamp);
                const now = new Date();
                const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                let timeString = '';

                if (diffInDays === 0) {
                    timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (diffInDays === 1) {
                    timeString = 'Yesterday';
                } else if (diffInDays < 7) {
                    timeString = date.toLocaleDateString([], { weekday: 'short' });
                } else {
                    timeString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }

                lastMessageFormatted = {
                    text: chat.lastMessage.text,
                    time: timeString,
                    isCurrentUser: chat.lastMessage.senderId === currentUser.id
                };
            }

            return {
                ...chat,
                otherParticipants,
                chatName,
                lastMessageFormatted
            };
        });
    }, [chats, currentUser, users]);

    // Memoize the create chat function
    const createChatMemoized = useCallback((participantIds: string[]) => {
        return createChat(participantIds);
    }, [createChat]);

    return {
        chats: processedChats,
        isLoading: loading,
        createChat: createChatMemoized,
        isEmpty: processedChats.length === 0
    };
} 