import React from 'react';
import { View, StyleSheet, Dimensions  } from 'react-native';
import { EmojiReactions } from './EmojiReaction';
import { UpdateMessage } from './UpdateMessage';
import { DeleteMessage } from './DeleteMessage';
import { Message } from '@/hooks/useChats';

interface MessageOptionsProps {
  message: Message;
  chatId: string;
  currentEmoji: string | null;
  isCurrentUser?: boolean;
  onCloseEmojiPicker: () => void;
  onEmojiSelect: (emoji: string | null) => void;
  setMessageText: (text: string) => void;
  setActiveEditMessage: (id: string | null) => void;
  onDeleteMessage: (chatId: string, messageId: string) => Promise<void>;
}

const screenWidth = Dimensions.get('window').width;

export function MessageOptions({
  message,
  chatId,
  currentEmoji,
  isCurrentUser,
  onCloseEmojiPicker,
  onEmojiSelect,
  setMessageText,
  setActiveEditMessage,
  onDeleteMessage,
}: MessageOptionsProps) {
  return (
    <View style={styles.optionsContainer}>
      <EmojiReactions
        message={message}
        chatId={chatId}
        currentEmoji={currentEmoji}
        onCloseEmojiPicker={onCloseEmojiPicker}
        onEmojiSelect={onEmojiSelect}
      />
      {isCurrentUser && (
        <>
          <View style={styles.separator} />
          <UpdateMessage
            message={message}
            onCloseEmojiPicker={onCloseEmojiPicker}
            setMessageText={setMessageText}
            setActiveEditMessage={setActiveEditMessage}
          />
      
          <DeleteMessage
            message={message}
            chatId={chatId}
            onCloseEmojiPicker={onCloseEmojiPicker}
            onDeleteMessage={onDeleteMessage}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 10,
    flexDirection: 'column',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    elevation: 3,
  },
  

  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 4,
  },
});