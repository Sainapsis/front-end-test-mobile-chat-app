import { Chat } from '@/src/domain/entities/chat';
import { User } from '@/src/domain/entities/user';

export interface ChatContextType {
  userChats: Chat[];
  setUserChats: React.Dispatch<React.SetStateAction<Chat[]>>
}
