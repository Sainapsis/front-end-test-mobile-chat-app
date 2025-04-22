import { useState, useCallback } from 'react';

interface UseMessageInputReturn {
  messageText: string;
  setMessageText: (text: string) => void;
  resetMessageInput: () => void;
}

export const useMessageInput = (): UseMessageInputReturn => {
  const [messageText, setMessageText] = useState('');

  const resetMessageInput = useCallback(() => {
    setMessageText('');
  }, []);

  return {
    messageText,
    setMessageText,
    resetMessageInput,
  };
}; 