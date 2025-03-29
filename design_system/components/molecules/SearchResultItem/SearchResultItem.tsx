import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { MessageBubble } from '@/design_system/components/organisms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { colors } from '@/design_system/ui/tokens';
import { styles } from './SearchResultItem.styles';

interface SearchResultItemProps {
  item: any;
  currentUserName?: string;
  currentUserId: string;
  onPress: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  currentUserName,
  currentUserId,
  onPress,
}) => (
  <TouchableOpacity style={styles.resultItem} onPress={onPress}>
    <View style={styles.messageHeader}>
      <View style={styles.headerLeft}>
        <IconSymbol 
          name="chevron.right" 
          size={16} 
          color={colors.neutral[400]} 
        />
        <ThemedText style={styles.chatName}>
          Chat with {item.participant_names?.split(',')
            .find((name: string) => name !== currentUserName)?.trim()}
        </ThemedText>
      </View>
      <ThemedText style={styles.timestamp}>
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