export interface Reaction {
   id: string;
   userId: string;
   emoji: string;
   timestamp: number;
 }
 
 export interface Message {
   id: string;
   senderId: string;
   text?: string;
   mediaUrl?: string;
   mediaType?: string;
   mediaThumbnail?: string;
   voiceUrl?: string;
   voiceDuration?: number;
   isVoiceMessage?: boolean;
   timestamp: number;
   reactions: Reaction[];
   status: "sending" | "sent" | "delivered" | "read";
   isEdited: boolean;
   editedAt?: number;
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