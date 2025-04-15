import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Modal, TextInput } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MessageReactions } from './MessageReactions';
import { ReactionMenu } from './ReactionMenu';
import { Colors } from '@/constants/Colors';
import { useAppContext } from '@/hooks/AppContext';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ImagePreviewModal } from './modals/ImagePreviewModal';

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    imageUrl?: string;
    voiceUrl?: string;
    timestamp?: number;
    delivery_status?: 'sending' | 'sent' | 'delivered' | 'read';
    is_read?: boolean;
    reactions?: Record<string, string>;
    is_edited?: boolean;
    isDeleted?: boolean;
    deletedFor?: string[];
    review?: boolean;
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
  const { currentUser } = useAppContext();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    const loadAudioDuration = async () => {
      if (!message.voiceUrl) return;

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: message.voiceUrl },
          { shouldPlay: false }
        );

        newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.durationMillis) {
            setTotalDuration(status.durationMillis);
            newSound.unloadAsync();
          }
        });
      } catch (error) {
        console.error('Error loading audio duration:', error);
      }
    };

    loadAudioDuration();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [message.voiceUrl]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const playSound = async () => {
    if (!message.voiceUrl) return;

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.voiceUrl },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.durationMillis) {
          setIsPlaying(status.isPlaying);
          setProgress(status.positionMillis / status.durationMillis);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(0);
          }
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
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
          <ThemedText style={{ ...styles.deletedText, color: Colors[isDark ? 'dark' : 'light'].text }}>Message deleted</ThemedText>
        </ThemedView>
      </View>
    );
  }
  if (message.voiceUrl) {
    return (
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={[styles.container, isSelected && styles.selectedMessage]}
      >
        <ThemedView style={[
          styles.bubble,
          styles.bubbleWidth,
          isCurrentUser
            ? [styles.selfBubble, styles.selfContainer, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
            : [styles.otherBubble, styles.otherContainer, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }],
        ]}>
          <View style={styles.voiceMessageContainer}>
            <Pressable onPress={isPlaying ? stopSound : playSound}>
              <IconSymbol
                name={isPlaying ? 'stop.circle.fill' : 'play.circle.fill'}
                size={32}
                color={isCurrentUser ? '#007AFF' : '#34C759'}
              />
            </Pressable>
            <View style={styles.voiceMessageInfo}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.voiceMessageDetails}>
                <ThemedText style={styles.voiceMessageDuration}>
                  {formatDuration(Math.floor(totalDuration * progress / 1000))} / {formatDuration(Math.floor(totalDuration / 1000))}
                </ThemedText>
                {isCurrentUser && (
                  <View style={styles.timeContainer}>
                    <ThemedText style={styles.timeText}>
                      {message.timestamp ? formatTime(message.timestamp) : ''}
                    </ThemedText>
                    {getDeliveryStatusIcon()}
                  </View>
                )}
              </View>
            </View>
          </View>
        </ThemedView>
      </Pressable>
    );
  }
  return (
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={[styles.container, isSelected && styles.selectedMessage]}
      >
        <ThemedView style={[
          styles.bubble,
          styles.bubbleWidth,
          isCurrentUser
            ? [styles.selfBubble, styles.selfContainer, { backgroundColor: isDark ? '#235A4A' : '#DCF8C6' }]
            : [styles.otherBubble, styles.otherContainer, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }],
        ]}>
          {message.imageUrl && (
            <Pressable onPress={() => setShowImagePreview(true)}>
              <Image
                source={{ uri: message.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </Pressable>
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
              {message.timestamp ? formatTime(message.timestamp) : ''}
            </ThemedText>
            {message.is_edited && (
              <ThemedText style={styles.editedText}>
                Edited
              </ThemedText>
            )}
            {isCurrentUser && message.delivery_status && (
              <View style={styles.statusContainer}>
                {getDeliveryStatusIcon()}
              </View>
            )}
          </View>
        </ThemedView>
        {message.reactions && (
          <View style={isCurrentUser ? styles.reactionsContainerSelf : styles.reactionsContainerOther}>
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

      <ImagePreviewModal
        visible={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={message.imageUrl || ''}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  bubbleWidth: {
    maxWidth: '85%',
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
    minWidth: "100%",
    maxWidth: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
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
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  voiceMessageInfo: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E1E1E1',
    borderRadius: 2,
    marginBottom: 4,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  voiceMessageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceMessageDuration: {
    fontSize: 12,
  },
}); 