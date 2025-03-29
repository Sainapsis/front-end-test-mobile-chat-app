import React from 'react';
import { FlatList } from 'react-native';
import { ThemedView, ThemedText } from '@/design_system/components/atoms';
import { SearchResultItem } from '@/design_system/components/molecules/SearchResultItem';
import { ErrorMessage } from '@/design_system/components/molecules/ErrorMessage';
import { styles } from './SearchResults.styles';

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