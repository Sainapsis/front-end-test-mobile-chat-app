import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Message } from '@/hooks/useChats';

interface DeleteMessageProps {
  message: Message;
  chatId: string;
  onCloseEmojiPicker: () => void;
  onDeleteMessage: (chatId: string, messageId: string) => Promise<void>;
}

export function DeleteMessage({
  message,
  chatId,
  onCloseEmojiPicker,
  onDeleteMessage,
}: DeleteMessageProps){

  const handleDeleteMessage = async () => {
    await onDeleteMessage(chatId, message.id);
    onCloseEmojiPicker();
  };

  return (
    <View style={[styles.container, { width: 205 }]}>
      <Pressable
        style={styles.actionButton}
        onPress={handleDeleteMessage}
      >
        <ThemedText style={styles.actionText}>Delete</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    elevation: 5,
    maxWidth: 205,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 18,
    textAlign: 'center',
  },
});