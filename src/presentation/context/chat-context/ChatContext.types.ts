import { Chat } from '@/src/domain/entities/chat';

export interface ChatContextType {
  userChats: Chat[];
  setUserChats: React.Dispatch<React.SetStateAction<Chat[]>>
}
