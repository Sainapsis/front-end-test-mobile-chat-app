export interface MediaAttachment {
    uri: string;
    previewUri: string;
    type: 'image' | 'video';
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
    status: 'sent' | 'delivered' | 'read';
    readBy?: string[];
    reaction?: string;
    editedAt?: number;
    isDeleted?: boolean;
    media?: MediaAttachment[];
}

export interface Chat {
    id: string;
    participants: string[];
    messages: Message[];
    lastMessage?: Message;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
}
