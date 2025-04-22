import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Modal, Alert, Animated } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { Message } from '@/interfaces/chatTypes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MessageStatus } from './MessageStatus';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ImageViewer } from './ImageViewer';
import { useVideoPlayer, VideoView } from 'expo-video';
import { messageBubbleStyles } from '@/styles/components/messageBubble.styles';
import { useFadeAnimation } from '@/hooks/useFadeAnimation';
import { MessageMedia } from './MessageMedia';
import { formatTimeOnly } from '@/utils/dateUtils';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, isCurrentUser, onDelete }: MessageBubbleProps) {
  const isDark = useColorScheme() === 'dark';
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [isVideoViewerVisible, setIsVideoViewerVisible] = useState(false);
  const { fadeAnim, fadeOut } = useFadeAnimation();

  const videoPlayer = useVideoPlayer(
    message.mediaType === 'video' && message.mediaUrl ? message.mediaUrl : 'https://example.com/placeholder.mp4',
    player => { player.loop = false; }
  );

  const handleLongPress = useCallback(() => {
    if (isCurrentUser) {
      Alert.alert(
        'Eliminar mensaje',
        '¿Estás seguro de que quieres eliminar este mensaje?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => fadeOut(() => onDelete?.(message.id)) }
        ]
      );
    }
  }, [isCurrentUser, fadeOut, onDelete, message.id]);

  useEffect(() => {
    if (!isVideoViewerVisible) videoPlayer.pause();
  }, [isVideoViewerVisible, videoPlayer]);

  const bubbleStyle = [
    messageBubbleStyles.bubble,
    isCurrentUser
      ? [messageBubbleStyles.selfBubble, { backgroundColor: '#E2E2B6' }]
      : [messageBubbleStyles.otherBubble, { backgroundColor: isDark ? '#2A2C33' : '#ffff' }]
  ];

  return (
    <>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={500}
          style={[messageBubbleStyles.container, isCurrentUser ? messageBubbleStyles.selfContainer : messageBubbleStyles.otherContainer]}
        >
          <View style={bubbleStyle}>
            <MessageMedia
              message={message}
              onImagePress={() => setIsImageViewerVisible(true)}
              onVideoPress={() => setIsVideoViewerVisible(true)}
            />
            {message.text && (
              <ThemedText style={[messageBubbleStyles.messageText, isCurrentUser && { color: '#000000' }]}>
                {message.text}
              </ThemedText>
            )}
            <View style={messageBubbleStyles.footer}>
              <ThemedText style={[messageBubbleStyles.timeText, isCurrentUser && { color: '#000000' }]}>
                {formatTimeOnly(new Date(message.timestamp))}
              </ThemedText>
              {isCurrentUser && (
                <View style={messageBubbleStyles.footerActions}>
                  <MessageStatus message={message} />
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
      <ImageViewer
        visible={isImageViewerVisible}
        onClose={() => setIsImageViewerVisible(false)}
        imageUri={message.mediaUrl || ''}
      />
      <Modal
        visible={isVideoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVideoViewerVisible(false)}
      >
        <View style={messageBubbleStyles.modalContainer}>
          <Pressable
            style={messageBubbleStyles.closeButton}
            onPress={() => setIsVideoViewerVisible(false)}
          >
            <IconSymbol name="close" size={24} color="#FFFFFF" />
          </Pressable>
          <VideoView
            player={videoPlayer}
            style={messageBubbleStyles.fullScreenVideo}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      </Modal>
    </>
  );
}
