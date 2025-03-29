import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { ThemedView, ThemedText } from '@/design_system/components/atoms';
import { SearchResultItem } from '@/design_system/components/molecules/SearchResultItem';
import { ErrorMessage } from '@/design_system/components/molecules/ErrorMessage';
import { styles } from './SearchResults.styles';
import { router, Stack } from 'expo-router';
import { IconSymbol } from '@/design_system/ui/vendors';
import { colors } from '@/design_system/ui/tokens';

interface SearchResultsProps {
  results: any[];
  error?: string;
  searchTerm: string;
  currentUser: any;
  onResultPress: (chatId: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  error,
  searchTerm,
  currentUser,
  onResultPress,
}) => (
  <>
    <Stack.Screen
      options={{
        headerTitle: 'Search Messages',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.primary[500]} />
          </TouchableOpacity>
        ),
      }}
    />
    {error && <ErrorMessage message={error} />}

    <FlatList
      data={results}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <SearchResultItem
          item={item}
          currentUserName={currentUser?.name}
          currentUserId={currentUser?.id || ''}
          onPress={() => onResultPress(item.chat_id)}
        />
      )}
      contentContainerStyle={styles.resultsContainer}
      ListEmptyComponent={() => (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>
            {searchTerm ? 'No messages found' : 'Start typing to search messages'}
          </ThemedText>
        </ThemedView>
      )}
    />
  </>
);