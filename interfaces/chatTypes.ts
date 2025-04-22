export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    timestamp: number;
    status: 'sent' | 'delivered' | 'read';
    mediaType?: 'image' | 'video' | 'audio' | 'file' | null;
    mediaUrl?: string | null;
    mediaSize?: number | null;
    mediaName?: string | null;
    reads?: Array<{
      userId: string;
      timestamp: number;
    }>;
  }
  
  export interface Chat {
    id: string;
    participants: User[];
    messages: Message[];
    lastMessage?: Message;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'away';
  }

 export interface Media {
    type: 'image' | 'video' | 'audio' | 'file';
    uri: string;
    name?: string;
    size?: number;
  }