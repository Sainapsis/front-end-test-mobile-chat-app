import { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getBubbleColors } from '@/design_system/components/organisms/MessageBubble/MessageBubble.styles';
import { Message } from '@/types/Chat';

interface UseMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, currentText: string) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (reactionId: string, messageId: string) => void;
  userId?: string;
}

export function useMessageBubble({ 
  message, 
  isCurrentUser,
  userId,
  onAddReaction,
  onRemoveReaction 
}: UseMessageBubbleProps) {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false); // State for options menu
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bubbleColors = getBubbleColors(isDark, isCurrentUser);

  const handleLongPress = () => {
    if (isCurrentUser) {
      setShowOptionsMenu(true); // Show options menu on long press
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
    handleRemoveReaction,
    showOptionsMenu,
    setShowOptionsMenu
  };
}