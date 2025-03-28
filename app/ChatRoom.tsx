import React, { useState, useRef, useEffect } from 'react';
import { FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/context/AppContext';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { MessageBubble } from '@/design_system/components/organisms';
import { ChatRoomTemplate } from '@/design_system/components/templates';

export default function ChatRoomScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { currentUser, users, chats, sendMessage, deleteMessage, addReaction, removeReaction, editMessage } = useAppContext();
  const [messageText, setMessageText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const chat = chats.find(c => c.id === chatId);
  const chatParticipants = chat?.participants
    .filter(id => id !== currentUser?.id)
    .map(id => users.find(user => user.id === id))
    .filter(Boolean) || [];

  const chatName = chatParticipants.length === 1
    ? chatParticipants[0]?.name
    : `${chatParticipants[0]?.name || 'Unknown'} & ${chatParticipants.length - 1} other${chatParticipants.length > 1 ? 's' : ''}`;

  const handleSendMessage = () => {
    if (messageText.trim() && currentUser && chat) {
      if (editingMessageId) {
        // If editing, update the message
        editMessage?.(editingMessageId, messageText.trim());
        setEditingMessageId(null);
      } else {
        // Otherwise, send a new message
        sendMessage(chat.id, messageText.trim(), currentUser.id);
      }
      setMessageText('');
    }
  };

  const handleEditMessage = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setMessageText(currentText);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (chat && currentUser) {
      await deleteMessage?.(messageId, chat.id);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (chat && currentUser) {
      await addReaction?.(messageId, emoji);
    }
  };

  const handleRemoveReaction = async (reactionId: string, messageId: string) => {
    if (chat && currentUser) {
      await removeReaction?.(reactionId, messageId);
    }
  };

  useEffect(() => {
    if (chat?.messages.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chat?.messages.length]);

  if (!chat || !currentUser) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Chat not found</ThemedText>
      </ThemedView>
    );
  }

  const sortedMessages = chat?.messages.sort((a, b) => a.timestamp - b.timestamp) || [];

  return (
    <>
      <StatusBar style="auto" />
      <ChatRoomTemplate
        chatName={chatName || 'Chat'}
        participantAvatar={{
          user: chatParticipants[0],
          size: 32
        }}
        messages={sortedMessages}
        messageText={messageText}
        isEditing={!!editingMessageId}
        onBack={() => router.back()}
        onMessageChange={setMessageText}
        onSendMessage={handleSendMessage}
        renderMessage={(item) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser.id}
            onDeleteMessage={handleDeleteMessage}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
            onEditMessage={handleEditMessage}
            userId={currentUser.id}
          />
        )}
        flatListRef={flatListRef}
      />
    </>
  );
}