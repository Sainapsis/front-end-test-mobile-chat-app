import React from 'react';
import { Pressable } from 'react-native';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles } from './ChatsHeader.styles';

interface ChatsHeaderProps {
  showClearAll: boolean;
  isLoading: boolean;
  onClearAll: () => void;
  onSearch: () => void;
  onNewChat: () => void;
}

export const ChatsHeader: React.FC<ChatsHeaderProps> = ({
  showClearAll,
  isLoading,
  onClearAll,
  onSearch,
  onNewChat,
}) => (
  <ThemedView style={styles.header}>
    {showClearAll && (
      <Pressable style={styles.clearAllButton} onPress={onClearAll}>
        <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
      </Pressable>
    )}
    <ThemedText type="title">Chats</ThemedText>
    <ThemedView style={styles.headerButtons}>
      <Pressable style={styles.iconButton} onPress={onSearch} disabled={isLoading}>
        <IconSymbol 
          name="magnifyingglass" 
          size={24} 
          color={isLoading ? '#CCCCCC' : '#007AFF'} 
        />
      </Pressable>
      <Pressable style={styles.iconButton} onPress={onNewChat} disabled={isLoading}>
        <IconSymbol 
          name="plus" 
          size={24} 
          color={isLoading ? '#CCCCCC' : '#007AFF'} 
        />
      </Pressable>
    </ThemedView>
  </ThemedView>
);