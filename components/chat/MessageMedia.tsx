import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { Message } from '@/interfaces/chatTypes';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { messageBubbleStyles } from '@/styles/components/messageBubble.styles';
import { useAppContext } from '@/hooks/AppContext';
import { formatFileSize } from '@/utils/fileUtils';

interface MessageMediaProps {
    message: Message;
    onImagePress: () => void;
    onVideoPress: () => void;
}

export const MessageMedia: React.FC<MessageMediaProps> = ({
    message,
    onImagePress,
    onVideoPress,
}) => {
    const { theme } = useAppContext();

    if (!message.mediaType || !message.mediaUrl) return null;

    const renderImage = () => (
        <Pressable onPress={onImagePress}>
            <Image
                source={{ uri: message.mediaUrl || '' }}
                style={messageBubbleStyles.media}
                resizeMode="cover"
            />
        </Pressable>
    );

    const renderVideo = () => (
        <Pressable onPress={onVideoPress}>
            <View style={messageBubbleStyles.videoContainer}>
                <View style={messageBubbleStyles.videoThumbnail}>
                    <IconSymbol name="videocam" size={32} color={theme.colors.tint} />
                    <View style={messageBubbleStyles.videoInfo}>
                        <ThemedText style={messageBubbleStyles.videoText}>
                            {message.mediaName || 'Video'}
                        </ThemedText>
                        {message.mediaSize && (
                            <ThemedText style={messageBubbleStyles.videoSize}>
                                {formatFileSize(message.mediaSize)}
                            </ThemedText>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );

    const renderAudio = () => (
        <View style={messageBubbleStyles.audioContainer}>
            <IconSymbol name="musical-note" size={24} color={theme.colors.tint} />
            <ThemedText style={messageBubbleStyles.audioText}>
                {message.mediaName || 'Audio'}
            </ThemedText>
        </View>
    );

    const renderFile = () => (
        <View style={[messageBubbleStyles.fileContainer, { backgroundColor: theme.colors.backgroundChat }]}>
            <IconSymbol name="document" size={24} color={theme.colors.tint} />
            <ThemedText style={messageBubbleStyles.fileText}>
                {message.mediaName || 'Archivo'}
            </ThemedText>
        </View>
    );

    switch (message.mediaType) {
        case 'image':
            return renderImage();
        case 'video':
            return renderVideo();
        case 'audio':
            return renderAudio();
        case 'file':
            return renderFile();
        default:
            return null;
    }
};