import { useState } from 'react';
import { searchMessages } from '@/database/db';

/**
 * Custom hook for handling message search functionality
 * @returns Object containing search results, loading state, error, and search handler
 */
export function useMessageSearch() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles message search operation
   * @param searchTerm - Text to search for
   * @param userId - ID of the user performing the search
   */
  const handleSearch = async (searchTerm: string, userId: string) => {
    if (!searchTerm.trim() || !userId) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const results = await searchMessages(searchTerm, userId);
      
      const formattedResults = Array.isArray(results) ? results : [];
      
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
