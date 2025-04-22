import React from 'react';
import { View, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/common/ThemedText';
import { Avatar } from '@/components/Avatar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { chatRoomScreenStyles } from '@/styles/screens/chatRoomScreenStyles.styles';

interface ChatHeaderProps {
  chatName: string;
  avatarUri?: string;
  avatarFallback: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ chatName, avatarUri, avatarFallback }) => {
  const router = useRouter();
  const { theme } = useAppContext();

  return (
    <Stack.Screen
      options={{
        headerTitle: () => (
          <View style={chatRoomScreenStyles.headerContainer}>
            <Avatar
              uri={avatarUri}
              fallback={avatarFallback}
              size={32}
            />
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {chatName}
            </ThemedText>
          </View>
        ),
        headerLeft: () => (
          <Pressable onPress={() => router.back()}>
            <IconSymbol name="chevron-back" size={24} color={theme.colors.tint} />
          </Pressable>
        ),
      }}
    />
  );
}; 