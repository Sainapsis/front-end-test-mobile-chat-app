import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { SearchTemplate } from '@/design_system/components/templates';
import { SearchResults } from '@/design_system/components/organisms';
import { useMessageSearch } from '@/hooks/useMessageSearch';

/**
 * Search screen component that handles message search functionality
 */
export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAppContext();
  const { searchResults, isSearching, error, handleSearch } = useMessageSearch();
  const router = useRouter();

  /**
   * Handles search input changes and triggers search
   * @param text - Search term entered by the user
   */
  const handleSearchInput = (text: string) => {
    setSearchTerm(text);
    if (currentUser?.id) {
      handleSearch(text, currentUser.id);
    }
  };

  /**
   * Handles navigation to chat room when a search result is pressed
   * @param chatId - ID of the chat to navigate to
   */
  const handleResultPress = (chatId: string) => {
    router.push({
      pathname: "/ChatRoom",
      params: { chatId }
    });
  };

  return (
    <SearchTemplate
      onSearch={handleSearchInput}
      placeholder="Search messages..."
      isLoading={isSearching}
      value={searchTerm}
    >
      <SearchResults
        results={searchResults}
        error={error || undefined}
        searchTerm={searchTerm}
        currentUser={currentUser}
        onResultPress={handleResultPress}
      />
    </SearchTemplate>
  );
}

