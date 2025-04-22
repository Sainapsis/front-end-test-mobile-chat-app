import React from 'react';
import { Pressable } from 'react-native';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedView } from '@/components/common/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { chatRoomScreenStyles } from '@/styles/screens/chatRoomScreenStyles.styles';
import { Media } from '@/interfaces/chatTypes';
import MediaPreviewContent from './MediaPreviewContent';

interface MediaPreviewProps {
  media: Media;
  onRemove: () => void;
  videoPlayer?: any;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media, onRemove, videoPlayer }) => {
  const { theme } = useAppContext();

  return (
    <ThemedView style={chatRoomScreenStyles.mediaPreviewContainer}>
      <Pressable style={chatRoomScreenStyles.removeMediaButton} onPress={onRemove}>
        <IconSymbol name="close" size={24} color={theme.colors.error} />
      </Pressable>
      <MediaPreviewContent media={media} videoPlayer={videoPlayer} />
    </ThemedView>
  );
}; 