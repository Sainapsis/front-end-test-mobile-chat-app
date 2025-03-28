import React from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import { BaseTemplate } from '../BaseTemplate';
import { colors } from '@/design_system/ui/tokens';
import { styles } from './SearchTemplate.styles';

interface SearchTemplateProps {
  children: React.ReactNode;
  onSearch: (term: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  value?: string;
  headerComponent?: React.ReactNode;
}

export const SearchTemplate: React.FC<SearchTemplateProps> = ({
  children,
  onSearch,
  placeholder = 'Search...',
  isLoading = false,
  value = '',
  headerComponent,
}) => {
  return (
    <BaseTemplate header={headerComponent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={value}
          onChangeText={onSearch}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary[500]} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </BaseTemplate>
  );
};

export default SearchTemplate;