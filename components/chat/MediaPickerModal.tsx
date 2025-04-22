import React from 'react';
import { View, Pressable, ActionSheetIOS, Platform, Modal } from 'react-native';
import { ThemedText } from '@/components/common/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { mediaPickerModalStyles } from '@/styles/components/mediaPickerModal.styles';
import { MEDIA_OPTIONS } from '@/constants/mediaOptions';
import { handleMediaSelection } from '@/helpers/handleMedia';
import MediaOptionButton from './MediaOptionButton';

interface MediaPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectVideo: () => void;
  onSelectFile: () => void;
}

export function MediaPickerModal({
  visible,
  onClose,
  onSelectImage,
  onSelectVideo,
  onSelectFile,
}: MediaPickerModalProps) {
  const isDark = useColorScheme() === 'dark';

  React.useEffect(() => {
    if (visible && Platform.OS === 'ios') {
      const options = ['Cancelar', ...MEDIA_OPTIONS.map(opt => opt.label)];

      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (buttonIndex) => {
          handleMediaSelection(buttonIndex, { onSelectImage, onSelectVideo, onSelectFile });
          onClose();
        }
      );
    }
  }, [visible, onClose, onSelectImage, onSelectVideo, onSelectFile]);

  if (Platform.OS === 'ios' || !visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={mediaPickerModalStyles.overlay} onPress={onClose}>
        <View
          style={[mediaPickerModalStyles.container, { backgroundColor: isDark ? '#2A2C33' : '#FFFFFF' }]}
          onStartShouldSetResponder={() => true}
        >
          <ThemedText style={mediaPickerModalStyles.title}>Select media</ThemedText>
          <View style={mediaPickerModalStyles.optionsContainer}>
            {MEDIA_OPTIONS.map((option, index) => (
              <MediaOptionButton
                key={index}
                option={option}
                onPress={() => {
                  onClose();
                  handleMediaSelection(index + 1, { onSelectImage, onSelectVideo, onSelectFile });
                }}
                isDark={isDark}
              />
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

