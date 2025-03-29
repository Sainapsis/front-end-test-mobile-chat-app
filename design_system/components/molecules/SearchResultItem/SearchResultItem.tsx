import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { MessageBubble } from '@/design_system/components/organisms/MessageBubble';
import { IconSymbol } from '@/design_system/ui/vendors/IconSymbol';
import { colors, themes as Colors } from '@/design_system/ui/tokens';
import { styles } from './SearchResultItem.styles';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SearchResultItemProps {
  item: any;
  currentUserName?: string;
  currentUserId: string;
  onPress: () => void;
}

export function SearchResultItem ({
  item,
  currentUserName,
  currentUserId,
  onPress,
}:SearchResultItemProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <TouchableOpacity style={[theme === 'light' ? {backgroundColor: Colors.light.text.secondary} : {backgroundColor:Colors.dark.text.secondary},styles.resultItem]} onPress={onPress}>
    <View style={styles.messageHeader}>
      <View style={styles.headerLeft}>
        <IconSymbol 
          name="chevron.right" 
          size={16} 
          color={colors.neutral[400]} 
        />
        <ThemedText style={[theme === 'light' ? {color: Colors.light.text.contrast} : {color:Colors.dark.text.contrast},styles.chatName]}>
          Chat with {item.participant_names?.split(',')
            .find((name: string) => name !== currentUserName)?.trim()}
        </ThemedText>
      </View>
      <ThemedText style={[theme === 'light' ? {color: Colors.light.text.secondary} : {color:Colors.dark.text.secondary},styles.timestamp]}>
        {new Date(item.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </ThemedText>
    </View>
    <MessageBubble
      message={item}
      isCurrentUser={item.sender_id === currentUserId}
      userId={currentUserId}
    />
  </TouchableOpacity>
  );
}