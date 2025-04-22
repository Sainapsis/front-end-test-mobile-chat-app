import { formatFileSize } from '@/utils/fileUtils';
import { useAppContext } from '@/hooks/AppContext';
import { Image, View } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { chatRoomScreenStyles } from '@/styles/screens/chatRoomScreenStyles.styles';
import { Media } from '@/interfaces/chatTypes';
import { VideoView } from 'expo-video';

const MediaPreviewContent: React.FC<{ media: Media; videoPlayer?: any }> = ({ media, videoPlayer }) => {
    const { theme } = useAppContext();

    switch (media.type) {
        case 'image':
            return (
                <Image
                    source={{ uri: media.uri }}
                    style={chatRoomScreenStyles.mediaPreview}
                    resizeMode="cover"
                />
            );
        case 'video':
            return (
                <View style={chatRoomScreenStyles.videoPreviewContainer}>
                    <VideoView
                        player={videoPlayer}
                        style={chatRoomScreenStyles.videoPreview}
                        allowsFullscreen
                        allowsPictureInPicture
                    />
                    <View style={chatRoomScreenStyles.videoInfoContainer}>
                        <ThemedText style={chatRoomScreenStyles.videoPreviewText}>
                            {media.name || 'Video'}
                        </ThemedText>
                        {media.size && (
                            <ThemedText style={chatRoomScreenStyles.videoPreviewSize}>
                                {formatFileSize(media.size)}
                            </ThemedText>
                        )}
                    </View>
                </View>
            );
        case 'file':
            return (
                <View style={chatRoomScreenStyles.filePreview}>
                    <IconSymbol name="document" size={32} color={theme.colors.tint} />
                    <View style={chatRoomScreenStyles.fileInfo}>
                        <ThemedText style={chatRoomScreenStyles.filePreviewText}>
                            {media.name || 'Archivo'}
                        </ThemedText>
                        {media.size && (
                            <ThemedText style={chatRoomScreenStyles.filePreviewSize}>
                                {formatFileSize(media.size)}
                            </ThemedText>
                        )}
                    </View>
                </View>
            );
        default:
            return null;
    }
};

export default MediaPreviewContent;