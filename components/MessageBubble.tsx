import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, Modal, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MessageReactions } from './MessageReactions';
import { ReactionMenu } from './ReactionMenu';

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    imageUrl?: string;
    timestamp: number;
    delivery_status: 'sending' | 'sent' | 'delivered' | 'read';
    is_read: boolean;
    reactions?: Record<string, string>;
  };
  isCurrentUser: boolean;
  onReactionPress?: (messageId: string, reaction: string) => void;
  onRemoveReaction?: (messageId: string) => void;
}

export function MessageBubble({ message, isCurrentUser, onReactionPress, onRemoveReaction }: MessageBubbleProps) {
  const isDark = useColorScheme() === 'dark';
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const screenWidth = Dimensions.get('window').width;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDeliveryStatusIcon = () => {
    if (!isCurrentUser) return null;

    if (message.is_read) {
      return (
        <View style={styles.doubleCheck}>
          <IconSymbol name="checkmark" size={12} color="#34C759" />
          <IconSymbol name="checkmark" size={12} color="#34C759" />
        </View>
      );
    }
    
    switch (message.delivery_status) {
      case 'sending':
        return <IconSymbol name="clock" size={12} color={isDark ? '#8F8F8F' : '#666666'} />;
      case 'sent':
        return <IconSymbol name="checkmark" size={12} color={isDark ? '#8F8F8F' : '#666666'} />;
      case 'delivered':
        return (
          <View style={styles.doubleCheck}>
            <IconSymbol name="checkmark" size={12} color={isDark ? '#8F8F8F' : '#666666'} />
            <IconSymbol name="checkmark" size={12} color={isDark ? '#8F8F8F' : '#666666'} />
          </View>
        );
      default:
        return null;
    }
  };

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setShowReactionMenu(true);
  };

  const handleReactionSelect = (reaction: string) => {
    if (onReactionPress) {
      onReactionPress(message.id, reaction);
    }
    setShowReactionMenu(false);
  };

  const handleRemoveReaction = () => {
    if (onRemoveReaction && isCurrentUser) {
      onRemoveReaction(message.id);
    }
    setShowReactionMenu(false);
  };

  const getCurrentReaction = () => {
    if (!message.reactions || !message.senderId) return undefined;
    const reaction = message.reactions[message.senderId];
    return reaction || undefined;
  };

  return (
    <>
      <Pressable onLongPress={handleLongPress}>
        <View style={[styles.container, isCurrentUser ? styles.selfContainer : styles.otherContainer]}>
          <ThemedView style={[
            styles.bubble,
            isCurrentUser 
              ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
              : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]
          ]}>
            {message.imageUrl && (
              <Image 
                source={{ uri: message.imageUrl }} 
                style={styles.image}
                resizeMode="cover"
              />
            )}
            {message.text && (
              <ThemedText style={[
                styles.messageText,
                isCurrentUser && !isDark && styles.selfMessageText
              ]}>
                {message.text}
              </ThemedText>
            )}
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timeText}>
                {formatTime(message.timestamp)}
              </ThemedText>
              {isCurrentUser && (
                <View style={styles.statusContainer}>
                  {getDeliveryStatusIcon()}
                </View>
              )}
            </View>
          </ThemedView>
          {message.reactions && (
            <MessageReactions
              reactions={message.reactions}
              onReactionPress={(reaction) => onReactionPress?.(message.id, reaction)}
            />
          )}
        </View>
      </Pressable>

      <Modal
        visible={showReactionMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowReactionMenu(false)}
        >
          <View style={[styles.menuContainer, { top: menuPosition.y }]}>
            <ReactionMenu
              onReactionSelect={handleReactionSelect}
              onRemoveReaction={handleRemoveReaction}
              currentReaction={getCurrentReaction()}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  selfContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
    marginRight: 4,
  },
  statusContainer: {
    marginLeft: 4,
  },
  doubleCheck: {
    flexDirection: 'row',
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
  },
}); 