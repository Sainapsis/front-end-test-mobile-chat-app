import React, { useState, useCallback, useRef } from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { useMessageSearch, type SearchResult } from '@/hooks/useMessageSearch';
import { ThemedText } from '@/components/common/ThemedText';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/hooks/AppContext';
import { messageSearchStyles } from '@/styles/components/messageSearch.styles';
import debounce from 'lodash/debounce';
import SearchBar from '../ui/SearchBar';
import SearchResultItem from './SearchResultItem';

interface MessageSearchProps {
  chatId?: string;
  onClose?: () => void;
}

const NoResults = ({ theme }: { theme: any }) => (
  <View style={messageSearchStyles.noResultsContainer}>
    <ThemedText style={[messageSearchStyles.noResults, { color: theme.colors.textSecondary }]}>
      No se encontraron mensajes
    </ThemedText>
  </View>
);

export const MessageSearch = ({ chatId, onClose }: MessageSearchProps) => {
  const [searchText, setSearchText] = useState('');
  const { results, isSearching, error, search, clearSearch } = useMessageSearch();
  const router = useRouter();
  const { theme } = useAppContext();

  const debouncedSearch = useRef(debounce((text: string) => {
    text.trim() ? search(text, chatId || '') : clearSearch();
  }, 300)).current;

  const handleSearch = (text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  };

  const handleResultPress = (chatId: string) => {
    router.push(`/ChatRoom?chatId=${chatId}`);
    onClose?.();
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <SearchResultItem item={item} onPress={handleResultPress} theme={theme} />
  );

  const renderContent = () => {
    if (error) return <ThemedText style={messageSearchStyles.error}>{error}</ThemedText>;
    if (isSearching) return <ActivityIndicator style={messageSearchStyles.loader} color={theme.colors.primary} />;
    if (results.length > 0) return (
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={messageSearchStyles.resultsList}
        keyboardShouldPersistTaps="handled"
      />
    );
    if (searchText) return <NoResults theme={theme} />;
    return null;
  };

  return (
    <View style={messageSearchStyles.container}>
      <SearchBar searchText={searchText} onSearch={handleSearch} theme={theme} />
      {renderContent()}
    </View>
  );
};
