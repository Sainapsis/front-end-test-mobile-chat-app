import { useState, useCallback } from 'react';
import { searchMessagesInDb, type DBMessage } from '@/database/db';
import { useAppContext } from './AppContext';

export interface SearchResult extends DBMessage {
  chatName: string;
}

export const useMessageSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chats, users } = useAppContext();

  const getChatName = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.participants.length < 2) return 'Unknown';
    return chat.participants[1].name || 'Unknown';
  }, [chats, users]);

  const search = useCallback(async (query: string, chatId?: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      
      const messages = await searchMessagesInDb(query, chatId);
      const searchResults = messages.map(msg => ({
        ...msg,
        chatName: getChatName(msg.chatId)
      }));

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching messages');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [getChatName]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearSearch
  };
}; 