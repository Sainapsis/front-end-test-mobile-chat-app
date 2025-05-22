import { ReactNode, useState } from "react";
import { ChatContext } from "./ChatContext";
import { Chat } from '@/src/domain/entities/chat';
import { useUser } from '../../hooks/useUser';

interface Props {
  children: ReactNode;
}

function ChatContent({ children }: Props) {
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const { loading: loadingUser } = useUser();
  
  const loading = loadingUser;

  const value = {
    loading,
    userChats,
    setUserChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function ChatProvider({ children }: Props) {
  return <ChatContent>{children}</ChatContent>;
}
