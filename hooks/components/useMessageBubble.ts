import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Alert } from 'react-native';
import { getBubbleColors } from '@/design_system/components/molecules/MessageBubble/MessageBubble.styles';
import { Message } from '@/hooks/useChats';

interface UseMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, currentText: string) => void; // Add onEditMessage prop
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (reactionId: string, messageId: string) => void;
  userId?: string; // Agregamos userId como prop
}

export function useMessageBubble({ 
  message, 
  isCurrentUser,
  userId, // Recibimos userId
  onDeleteMessage,
  onAddReaction,
  onEditMessage, 
  onRemoveReaction 
}: UseMessageBubbleProps) {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bubbleColors = getBubbleColors(isDark, isCurrentUser);

  const handleLongPress = () => {
    if (isCurrentUser) {
      Alert.alert(
        'Message Options',
        'What would you like to do?',
        [
          { 
            text: 'Add Reaction', 
            onPress: () => setShowEmojiSelector(true) 
          },
          { 
            text: 'Edit', 
            onPress: () => onEditMessage?.(message.id, message.text), // Add edit option
          },
          { 
            text: 'Delete', 
            onPress: () => onDeleteMessage?.(message.id),
            style: 'destructive' 
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          }
        ]
      );
    } else {
      setShowEmojiSelector(true);
    }
  };

  const handleEmojiSelected = (emoji: string) => {
    if (!userId) return;

    const hasUserReaction = message.reactions.some(reaction => reaction.userId === userId);
    
    if (hasUserReaction) {
      const existingReaction = message.reactions.find(reaction => reaction.userId === userId);
      if (existingReaction) {
        handleRemoveReaction(existingReaction.id);
      }
    }
    
    onAddReaction?.(message.id, emoji);
    setShowEmojiSelector(false);
  };

  const handleRemoveReaction = (reactionId: string) => {
    onRemoveReaction?.(reactionId, message.id);
  };

  return { 
    isDark, 
    bubbleColors, 
    handleLongPress,
    showEmojiSelector,
    setShowEmojiSelector,
    handleEmojiSelected,
    handleRemoveReaction
  };
}