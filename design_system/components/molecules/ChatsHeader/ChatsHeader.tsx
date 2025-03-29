import React, { useState } from 'react';
import { Pressable, Alert } from 'react-native';
import { Button, ThemedText, ThemedView } from '@/design_system/components/atoms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles } from './ChatsHeader.styles';
import { colors } from '@/design_system/ui/tokens';

interface ChatsHeaderProps {
  /** Whether to show the "Clear All" button */
  showClearAll: boolean;
  /** Whether the component is in a loading state */
  isLoading: boolean;
  /** Function to be called when "Clear All" is confirmed */
  onClearAll: () => void;
  /** Function to be called when the search icon is pressed */
  onSearch: () => void;
  /** Function to be called when the new chat icon is pressed */
  onNewChat: () => void;
}

/**
 * ChatsHeader component provides a header for the chats screen.
 * It includes options for clearing all chats, searching, and starting a new chat.
 */
export const ChatsHeader: React.FC<ChatsHeaderProps> = ({
  showClearAll,
  isLoading,
  onClearAll,
  onSearch,
  onNewChat,
}) => {
  const handleClearAll = () => {
    Alert.alert(
      'Clear All Chats',
      'Are you sure you want to clear all your conversations? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          onPress: onClearAll,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ThemedView style={styles.header}>
      {showClearAll && (
        <Button 
          style={styles.clearAllButton} 
          onPress={handleClearAll}
          variant="ghost"
        >
          <ThemedText style={styles.clearAllText}>Clear All</ThemedText>
        </Button>
      )}
      <ThemedText type="title">Chats</ThemedText>
      <ThemedView style={styles.headerButtons}>
        <Pressable style={styles.iconButton} onPress={onSearch} disabled={isLoading}>
          <IconSymbol 
            name="magnifyingglass" 
            size={24} 
            color={isLoading ? colors.warning.main : colors.primary.dark} 
          />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={onNewChat} disabled={isLoading}>
          <IconSymbol 
            name="plus" 
            size={24} 
            color={isLoading ? colors.warning.main : colors.primary.dark} 
          />
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
};