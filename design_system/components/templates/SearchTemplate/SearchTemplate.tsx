import React from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import { BaseTemplate } from '../BaseTemplate';
import { colors, themes as Colors } from '@/design_system/ui/tokens';
import { styles } from './SearchTemplate.styles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText, ThemedView } from '@/design_system/components/atoms';

interface SearchTemplateProps {
  /** Main content of the template */
  children: React.ReactNode;
  /** Function to be called when searching */
  onSearch: (term: string) => void;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Whether the search is loading */
  isLoading?: boolean;
  /** Current value of the search input */
  value?: string;
  /** Optional header component */
  headerComponent?: React.ReactNode;
}

/**
 * SearchTemplate component provides a layout for search screens.
 * It includes a search input, loading indicator, and content area.
 */
export const SearchTemplate: React.FC<SearchTemplateProps> = ({
  children,
  onSearch,
  placeholder = 'Search...',
  isLoading = false,
  value = '',
  headerComponent,
}) => {
  const theme = useColorScheme() ?? 'light';

  return (
    <BaseTemplate header={headerComponent}>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onSearch}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
        />
        {isLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator color={theme === 'light' ? Colors.light.text.contrast : Colors.dark.text.contrast} />
          </ThemedView>
        )}
      </ThemedView>
      <ThemedView style={styles.content}>
        {children}
      </ThemedView>
    </BaseTemplate>
  );
};

export default SearchTemplate;