import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert } from 'react-native';
import { getBubbleColors } from '@/design_system/components/molecules/MessageBubble/MessageBubble.styles';
import { Message } from '@/hooks/useChats';

interface UseMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

export function useMessageBubble({ message, isCurrentUser, onDeleteMessage }: UseMessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bubbleColors = getBubbleColors(isDark, isCurrentUser);

  const handleLongPress = () => {
    if (isCurrentUser && onDeleteMessage) {
      Alert.alert(
        'Delete Message',
        'Do you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', onPress: () => onDeleteMessage(message.id), style: 'destructive' }
        ]
      );
    }
  };

  return { isDark, bubbleColors, handleLongPress };
}