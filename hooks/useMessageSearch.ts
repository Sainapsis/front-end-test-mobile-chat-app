import { useState } from 'react';
import { searchMessages } from '@/database/db';

export function useMessageSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchTerm: string, userId: string) => {
    if (!searchTerm.trim() || !userId) {
      console.log('Search cancelled: Empty search term or missing userId');
      setSearchResults([]);
      return;
    }

    try {
      console.log('Starting search with:', { searchTerm, userId });
      setIsSearching(true);
      setError(null);

      const results = await searchMessages(searchTerm, userId);
      console.log('Search results:', results);
      
      const formattedResults = Array.isArray(results) ? results : [];
      console.log('Formatted results:', formattedResults);
      
      setSearchResults(formattedResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Search error details:', err);
      setError(`Failed to search messages: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchResults,
    isSearching,
    error,
    handleSearch,
  };
}
