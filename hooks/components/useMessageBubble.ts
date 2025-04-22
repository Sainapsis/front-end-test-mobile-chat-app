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

/**
 * Custom hook for handling message bubble interactions and styling
 * @param message - Message object containing content and reactions
 * @param isCurrentUser - Boolean indicating if the message belongs to the current user
 * @param onAddReaction - Callback function for adding reactions
 * @param onRemoveReaction - Callback function for removing reactions
 * @param userId - ID of the current user
 * @returns Object containing styling, handlers, and state for message bubble
 */
export function useMessageBubble({ 
  message, 
  isCurrentUser,
  userId,
  onAddReaction,
  onRemoveReaction 
}: UseMessageBubbleProps) {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bubbleColors = getBubbleColors(isDark, isCurrentUser);

  /**
   * Handles long press event on message bubble
   */
  const handleLongPress = () => {
    if (isCurrentUser) {
      setShowOptionsMenu(true);
    } else {
      setShowEmojiSelector(true);
    }
  };

  /**
   * Handles emoji selection for reactions
   * @param emoji - Selected emoji string
   */
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

  /**
   * Handles removal of a reaction
   * @param reactionId - ID of the reaction to remove
   */
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