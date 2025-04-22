import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer } from 'expo-video';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { MediaPickerModal } from '@/components/chat/MediaPickerModal';
import { chatRoomScreenStyles } from '@/styles/screens/chatRoomScreenStyles.styles';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatScroll } from '@/hooks/useChatScroll';
import { useMessageInput } from '@/hooks/useMessageInput';
import { useMediaPicker } from '@/hooks/useMediaPicker';
// import { useMessageStatus } from '@/hooks/useMessageStatus';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MediaPreview } from '@/components/chat/MediaPreview';
import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessagesList } from '@/components/chat/ChatMessagesList';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { theme } = useAppContext();
  const [isMediaPickerVisible, setIsMediaPickerVisible] = React.useState(false);

  const {
    chat,
    currentUser,
    isSending,
    handleSendMessage,
    handleDeleteMessage,
  } = useChatMessages(chatId);

  const {
    messageText,
    setMessageText,
    resetMessageInput,
  } = useMessageInput();

  const {
    pickImage,
    pickVideo,
    pickFile,
    selectedMedia,
    setSelectedMedia,
    prepareMedia,
  } = useMediaPicker();

  // const { onViewableItemsChanged } = useMessageStatus();

  const {
    flatListRef,
    scrollToBottom,
  } = useChatScroll();

  const videoPlayer = useVideoPlayer(selectedMedia?.type === 'video' ? selectedMedia.uri : '', player => {
    player.loop = false;
    player.play();
  });

  const chatName = chat?.participants?.length === 2
    ? chat?.participants[1]?.name
    : chat?.participants[0]?.name;

  useEffect(() => {
    if (chat?.messages.length) {
      scrollToBottom();
    }
  }, [chat?.messages.length, scrollToBottom]);

  const handleSendMessageWrapper = async () => {
    if (messageText.trim() || selectedMedia) {
      const mediaToSend = selectedMedia ? prepareMedia(selectedMedia) : null;
      await handleSendMessage(messageText, mediaToSend);
      resetMessageInput();
      setSelectedMedia(null);
      scrollToBottom();
    }
  };

  if (!chat || !currentUser) {
    return (
      <ThemedView style={chatRoomScreenStyles.centerContainer}>
        <ThemedText>Chat not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={chatRoomScreenStyles.container}>
      <StatusBar style="auto" />
      <ChatHeader
        chatName={chatName || ''}
        avatarUri={chat?.participants[1]?.avatar}
        avatarFallback={chat?.participants[1]?.name[1]}
      />

      <KeyboardAvoidingView
        style={[chatRoomScreenStyles.container, { backgroundColor: theme.colors.backgroundChat }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatMessagesList
          messages={chat.messages}
          currentUserId={currentUser.id}
          onDeleteMessage={handleDeleteMessage}
          flatListRef={flatListRef}
        />

        {selectedMedia && (
          <MediaPreview
            media={selectedMedia}
            onRemove={() => setSelectedMedia(null)}
            videoPlayer={videoPlayer}
          />
        )}

        <ChatInput
          messageText={messageText}
          setMessageText={setMessageText}
          selectedMedia={selectedMedia}
          isSending={isSending}
          onSend={handleSendMessageWrapper}
          onShowMediaOptions={() => setIsMediaPickerVisible(true)}
          onPickImage={pickImage}
        />
      </KeyboardAvoidingView>

      <MediaPickerModal
        visible={isMediaPickerVisible}
        onClose={() => setIsMediaPickerVisible(false)}
        onSelectImage={pickImage}
        onSelectVideo={pickVideo}
        onSelectFile={pickFile}
      />
    </SafeAreaView>
  );
}

