import React from 'react';
import { StyleSheet, View, Pressable, TextInput, FlatList } from 'react-native';
import { ThemedText } from '../ThemedText';
import { IconSymbol } from '../ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BaseModal } from './BaseModal';
import { MessageBubble } from '../MessageBubble';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filteredMessages: Array<{
    id: string;
    text: string;
    senderId: string;
    reactions?: Record<string, string>;
  }>;
  currentUser: {
    id: string;
  } | null;
  selectedMessages: Array<{
    messageId: string;
    senderId: string;
  }>;
  onReactionPress?: (messageId: string, reaction: string) => void;
  onRemoveReaction?: (messageId: string) => void;
}

export function SearchModal({
  visible,
  onClose,
  searchQuery,
  onSearchQueryChange,
  filteredMessages,
  currentUser,
  selectedMessages,
  onReactionPress,
  onRemoveReaction
}: SearchModalProps) {
  const colorScheme = useColorScheme();

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
    >
      <View style={[
        styles.searchHeader,
        { borderBottomColor: Colors[colorScheme].icon }
      ]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: Colors[colorScheme].background,
              color: Colors[colorScheme].text,
              borderColor: Colors[colorScheme].icon
            }
          ]}
          placeholder="Search messages..."
          placeholderTextColor={Colors[colorScheme].icon}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          autoFocus
        />
        <Pressable onPress={onClose}>
          <IconSymbol name="xmark" size={24} color={Colors[colorScheme].tint} />
        </Pressable>
      </View>

      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isCurrentUser={item.senderId === currentUser?.id}
            onReactionPress={onReactionPress}
            onRemoveReaction={onRemoveReaction}
            selectedMessages={selectedMessages}
          />
        )}
        contentContainerStyle={styles.searchResultsContainer}
      />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchResultsContainer: {
    padding: 10,
  },
}); 