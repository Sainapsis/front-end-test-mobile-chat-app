import { Chat, useChats } from "@/hooks/useChats";
import { createContext, useContext } from "react";

interface ChatContextType {
    chats: Chat[];
    createChat: (participantIds: string[]) => Promise<Chat | null>;
    loadingChats: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function ChatContent({ children }: { children: React.ReactNode }) {
    const { chats, loadingChats, createChat } = useChats();
    const value = {
        chats,
        createChat,
        loadingChats,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    return (
        <ChatContent>
            {children}
        </ChatContent>
    )
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within an AppProvider');
    }
    return context;
}