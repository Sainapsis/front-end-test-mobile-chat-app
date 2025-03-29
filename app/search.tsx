import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { SearchTemplate } from '@/design_system/components/templates';
import { SearchResults } from '@/design_system/components/organisms';
import { ScreenHeader } from '@/design_system/components/molecules';
import { useMessageSearch } from '@/hooks/useMessageSearch';

export default function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useAppContext();
  const { searchResults, isSearching, error, handleSearch } = useMessageSearch();
  const router = useRouter();

  const handleSearchInput = (text: string) => {
    setSearchTerm(text);
    if (currentUser?.id) {
      handleSearch(text, currentUser.id);
    }
  };

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

