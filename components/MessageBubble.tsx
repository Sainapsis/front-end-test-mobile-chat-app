import React, { useState, useRef, memo } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Pressable, Text, Image, ScrollView, Dimensions} from 'react-native';
import { ThemedText } from './ThemedText';
import { Message } from '@/hooks/useChats';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol, IconSymbolName } from './ui/IconSymbol';
import * as Haptics from 'expo-haptics';
import { MediaAttachment } from '@/types/types';
import { Video, ResizeMode } from 'expo-av';
import styles from '@/styles/MessageBubbleStyles';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  chatId: string;
  // Additional props for handling reactions, deletion, and editing
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
  scrollViewRef?: React.RefObject<any>;
}

const arePropsEqual = (prevProps: MessageBubbleProps, nextProps: MessageBubbleProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.message.editedAt === nextProps.message.editedAt &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.reaction === nextProps.message.reaction &&
    prevProps.message.readBy === nextProps.message.readBy &&
    prevProps.message.media === nextProps.message.media &&
    prevProps.isCurrentUser === nextProps.isCurrentUser &&
    prevProps.chatId === nextProps.chatId
  );
};

export const MessageBubble = memo(function MessageBubble({ message, isCurrentUser, chatId, onReact, onDelete, onEdit }: MessageBubbleProps) {
  const bubbleColor = useThemeColor({}, isCurrentUser ? 'selfBubble' : 'otherBubble');
  const bubbleTextColor = useThemeColor({}, 'bubbleText');
  const iconThemeColor = useThemeColor({}, 'icon');
  const [showReactions, setShowReactions] = useState(false);
  const reactionButtonColor = useThemeColor({}, 'text');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);
  const [selectedImage, setSelectedImage] = useState<MediaAttachment | null>(null);
  const anchorRef = useRef(null);

  const isMessageEditable = () => {
    if (!isCurrentUser) return false;
    const now = Date.now();
    const messageTime = message.timestamp;
    const maxMinutes = 5 * 60 * 1000;
    return (now - messageTime) <= maxMinutes;
  };

  const handleDelete = () => {
    if (onDelete) {
      // For debugging purposes
      console.log("Borrando mensaje:", message.id);
      onDelete(message.id);
    }
  };
  
  // Confirmation for deletion
  const showDeleteConfirmation = () => {
    setShowContextMenu(false);
    
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: handleDelete
        }
      ]
    );
  };
  
  const startEditing = () => {
    if (!isMessageEditable()) {
      return;
    }
    setIsEditing(true);
    setShowContextMenu(false);
  };
  
  const saveEdit = () => {
    if (onEdit && editedText !== message.text) {
      // For debugging purposes
      console.log("Editando mensaje:", message.id, "nuevo texto:", editedText);
      onEdit(message.id, editedText);
    }
    setIsEditing(false);
  };
  
  const cancelEdit = () => {
    setEditedText(message.text);
    setIsEditing(false);
  };

  const handleReactionSelect = (emoji: string) => {
    if (onReact) {
      // For debugging purposes
      console.log("Reaccionando a mensaje:", message.id, "con emoji:", emoji);
      onReact(message.id, emoji);
    }
    setShowReactions(false);
  };
  
  const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    let iconName: IconSymbolName = 'checkmark';
    let iconColor = iconThemeColor;
    
    console.log(`Message ${message.id} status:`, message.status);
    
    if (message.status === 'delivered') {
      iconName = 'checkmark.diamond';
    } else if (message.status === 'read') {
      iconName = 'eye.fill';
    }
    return (
      <IconSymbol
        name={iconName}
        size={12}
        color={iconColor}
        style={{ marginLeft: 4 }}
      />
    );
  };

  return (
    <View style={[
      styles.container,
      isCurrentUser ? styles.selfContainer : styles.otherContainer
    ]}>
      {isEditing ? (
        // Modo edición
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, { backgroundColor: bubbleColor }]}
            value={editedText}
            onChangeText={setEditedText}
            autoFocus
            multiline
          />
          <View style={styles.editButtons}>
            <TouchableOpacity onPress={cancelEdit} style={styles.editButton}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveEdit} style={styles.editButton}>
              <ThemedText style={styles.saveText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[
          styles.messageWrapper,
          { position: 'relative' }
        ]}>
          <TouchableOpacity
            ref={anchorRef}
            onLongPress={() => {
              if (isCurrentUser) {
                setShowContextMenu(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={[
              styles.bubble,
              isCurrentUser ? styles.selfBubble : styles.otherBubble,
              { backgroundColor: bubbleColor }
            ]}>
              {message.media && message.media.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mediaContainer}
                >
                  {message.media.map((media: MediaAttachment, index: number) => (
                    <TouchableOpacity
                      key={`media-${index}`}
                      onPress={() => {
                        setSelectedImage(media);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      {media.type === 'video' ? (
                        <Video
                          source={{ uri: media.previewUri }}
                          style={styles.mediaPreview}
                          resizeMode={ResizeMode.COVER}
                          useNativeControls
                          isLooping
                        />
                      ) : (
                        <Image
                          source={{ uri: media.previewUri }}
                          style={styles.mediaPreview}
                          resizeMode="cover"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {message.text && (
                <ThemedText style={[
                  styles.messageText,
                  { color: bubbleTextColor }
                ]}>
                  {message.text}
                </ThemedText>
              )}

              {/* Editado */}
              {message.editedAt && message.editedAt > message.timestamp && (
                <ThemedText style={styles.editedIndicator}>(edited)</ThemedText>
              )}

              {/* Hora y estado */}
              <View style={styles.timeContainer}>
                <ThemedText style={styles.timeText}>
                  {formatTime(message.editedAt || message.timestamp)}
                </ThemedText>
                {getStatusIcon()}
              </View>

              {/* Reacción actual */}
              {message.reaction && (
                <View style={[
                  styles.currentReaction,
                  isCurrentUser ? styles.selfReaction : styles.otherReaction
                ]}>
                  <ThemedText style={styles.reactionEmoji}>{message.reaction}</ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Botón de reacción */}
          <TouchableOpacity 
            onPress={() => {setShowReactions(!showReactions), Haptics.selectionAsync();}}
            style={[
              styles.reactionButton,
              isCurrentUser ? styles.selfReactionButton : styles.otherReactionButton
            ]}
          >
            <ThemedText style={[styles.reactionIcon, { color: reactionButtonColor }]}>
              {message.reaction ? '🔄' : '➕'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Full Screen Media Viewer */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable 
          style={styles.fullScreenImageContainer}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage?.type === 'video' ? (
            <Video
              source={{ uri: selectedImage.uri }}
              style={styles.fullScreenImage}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              isLooping
            />
          ) : (
            <Image
              source={{ uri: selectedImage?.uri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>

      <Modal
        visible={showContextMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContextMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowContextMenu(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {isMessageEditable() && (
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={startEditing}
                >
                  <Text style={styles.modalButtonText}>Edit Message</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={styles.modalButton}
                onPress={showDeleteConfirmation}
              >
                <Text style={styles.modalButtonText}>Delete Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={showReactions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReactions(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowReactions(false)}
        >
          <View style={styles.reactionsContainer}>
            {EMOJIS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                onPress={() => {handleReactionSelect(emoji); Haptics.selectionAsync();}}
                style={styles.reactionOption}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}, arePropsEqual);