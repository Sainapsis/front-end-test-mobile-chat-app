import React, { useState } from 'react';
import { View, StyleSheet, Image, Pressable, Modal, TextInput } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MessageReactions } from './MessageReactions';
import { ReactionMenu } from './ReactionMenu';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/hooks/AppContext';

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
    is_edited: boolean;
    isDeleted: boolean;
    deletedFor?: string[];
  };
  isCurrentUser: boolean;
  isSelected?: boolean;
  onSelect?: (messageId: string) => void;
  onReactionPress?: (messageId: string, reaction: string) => void;
  onRemoveReaction?: (messageId: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  selectedMessages: { messageId: string; senderId: string }[];
  selectedCount?: number;
}

export function MessageBubble({
  message,
  isCurrentUser,
  isSelected,
  onSelect,
  onReactionPress,
  onRemoveReaction,
  onEdit,
  selectedMessages,
}: MessageBubbleProps) {
  const isDark = useColorScheme() === 'dark';
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { currentUser} = useAppContext();
  
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
    onSelect?.(message.id);
  };

  const handlePress = () => {
    if (selectedMessages.length >= 1) {
      onSelect?.(message.id);
    }
  };

  const handleSaveEdit = () => {
    if (editedText.trim() && onEdit) {
      onEdit(message.id, editedText.trim());
    }
    setIsEditing(false);
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

  
  if (currentUser && message.deletedFor?.includes(currentUser.id)) {
    return (null);
  }

  if (message.isDeleted) {
    return (
      <View style={[styles.container]}>
        <ThemedView style={[
          styles.bubble,
          styles.deletedMessage,
          styles.bubbleWidth,
          isCurrentUser ? styles.selfContainer : styles.otherContainer,
          { backgroundColor: isDark ? '#999999' : '#E1E1E1' }
        ]}>
          <ThemedText style={{...styles.deletedText, color: Colors[isDark ? 'dark' : 'light'].text}}>Message deleted</ThemedText>
        </ThemedView>
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={[
          styles.container,
          isCurrentUser ? styles.selfContainer : styles.otherContainer,
          isSelected && styles.selectedMessage
        ]}
      >
        <ThemedView style={[
          styles.bubble,
          styles.bubbleWidth,
          isCurrentUser
            ? [styles.selfBubble, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
            : [styles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }],
            styles.bubbleWidth, isCurrentUser ? styles.selfContainer : styles.otherContainer
        ]}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: Colors[isDark ? 'dark' : 'light'].background,
                    color: Colors[isDark ? 'dark' : 'light'].text,
                    borderColor: Colors[isDark ? 'dark' : 'light'].icon
                  }
                ]}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                autoFocus
              />
              <View style={styles.editButtons}>
                <Pressable onPress={handleSaveEdit} style={styles.editButton}>
                  <IconSymbol name="checkmark" size={20} color={Colors[isDark ? 'dark' : 'light'].tint} />
                </Pressable>
                <Pressable onPress={() => setIsEditing(false)} style={styles.editButton}>
                  <IconSymbol name="xmark" size={20} color={Colors[isDark ? 'dark' : 'light'].tint} />
                </Pressable>
              </View>
            </View>
          ) : (
            <>
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
                {message.is_edited && (
                  <ThemedText style={styles.editedText}>
                    Edited
                  </ThemedText>
                )}
                {isCurrentUser && (
                  <View style={styles.statusContainer}>
                    {getDeliveryStatusIcon()}
                  </View>
                )}
              </View>
            </>
          )}
        </ThemedView>
        {message.reactions && (
          <View style={isCurrentUser? styles.reactionsContainerSelf : styles.reactionsContainerOther}>
            <MessageReactions
              reactions={message.reactions}
              onReactionPress={(reaction) => onReactionPress?.(message.id, reaction)}
            />
          </View>
        )}
      </Pressable>

      <Modal
        visible={showReactionMenu && selectedMessages.length === 1 && selectedMessages[0].messageId === message.id}
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
    width: '100%',
  },
  bubbleWidth: {
    width: '80%',
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
  editedText: {
    fontSize: 11,
    opacity: 0.7,
    marginRight: 4,
    fontStyle: 'italic'
  },
  doubleCheck: {
    flexDirection: 'row',
    gap: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }],
    backgroundColor: 'transparent',
  },
  selectedMessage: {
    backgroundColor: 'rgba(128, 128, 255, 0.2)',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  editButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionButton: {
    padding: 5,
  },
  deletedMessage: {
    opacity: 0.5,
  },
  deletedText: {
    fontStyle: 'italic',
    color: '#666666',
  },
  reactionsContainerSelf: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  reactionsContainerOther: {
    alignSelf: 'flex-start',
    marginTop: -4,
  },
}); 