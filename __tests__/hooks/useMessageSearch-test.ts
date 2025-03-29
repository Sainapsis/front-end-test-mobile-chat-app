import { renderHook, act } from '@testing-library/react-native';
import { useMessageSearch } from '@/hooks/useMessageSearch';
import { searchMessages } from '@/database/db';

// Mock de la función searchMessages
jest.mock('@/database/db', () => ({
  searchMessages: jest.fn()
}));

describe('useMessageSearch Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMessageSearch());
    
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not search with empty search term', async () => {
    const { result } = renderHook(() => useMessageSearch());
    
    await act(async () => {
      await result.current.handleSearch('', 'user123');
    });
    
    expect(searchMessages).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
    expect(console.log).toHaveBeenCalledWith('Search cancelled: Empty search term or missing userId');
  });

  it('should not search with missing userId', async () => {
    const { result } = renderHook(() => useMessageSearch());
    
    await act(async () => {
      await result.current.handleSearch('test', '');
    });
    
    expect(searchMessages).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
  });

  it('should search messages successfully', async () => {
    const mockResults = [
      { id: '1', content: 'Hello world' },
      { id: '2', content: 'Test message' }
    ];
    
    (searchMessages as jest.Mock).mockResolvedValueOnce(mockResults);
    
    const { result } = renderHook(() => useMessageSearch());
    
    await act(async () => {
      await result.current.handleSearch('test', 'user123');
    });
    
    expect(searchMessages).toHaveBeenCalledWith('test', 'user123');
    expect(result.current.searchResults).toEqual(mockResults);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle non-array results', async () => {
    (searchMessages as jest.Mock).mockResolvedValueOnce(null);
    
    const { result } = renderHook(() => useMessageSearch());
    
    await act(async () => {
      await result.current.handleSearch('test', 'user123');
    });
    
    expect(result.current.searchResults).toEqual([]);
  });

  it('should handle search errors', async () => {
    const testError = new Error('Test error');
    (searchMessages as jest.Mock).mockRejectedValueOnce(testError);
    
    const { result } = renderHook(() => useMessageSearch());
    
    await act(async () => {
      await result.current.handleSearch('test', 'user123');
    });
    
    expect(result.current.error).toBe('Failed to search messages: Test error');
    expect(result.current.isSearching).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Search error details:', testError);
  });

  it('should handle unknown errors', async () => {
    (searchMessages as jest.Mock).mockRejectedValueOnce('Unknown error object');
    
    const { result } = renderHook(() => useMessageSearch());
    
    await act(async () => {
      await result.current.handleSearch('test', 'user123');
    });
    
    expect(result.current.error).toBe('Failed to search messages: Unknown error');
    expect(result.current.isSearching).toBe(false);
  });
});