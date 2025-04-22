import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { messageSearchStyles } from '@/styles/components/messageSearch.styles';

const SearchBar = ({
    searchText,
    onSearch,
    theme
}: {
    searchText: string;
    onSearch: (text: string) => void;
    theme: any;
}) => (
    <View style={[messageSearchStyles.searchBar, { borderBottomColor: theme.colors.border }]}>
        <IconSymbol name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
            style={[messageSearchStyles.input, { color: theme.colors.text }]}
            value={searchText}
            onChangeText={onSearch}
            placeholder="Search messages..."
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
            accessibilityLabel="Search messages"
        />
        {searchText ? (
            <Pressable onPress={() => onSearch('')} accessibilityRole="button" accessibilityLabel="Clear search">
                <IconSymbol name="close-circle" size={20} color={theme.colors.textSecondary} />
            </Pressable>
        ) : null}
    </View>
);

export default SearchBar;
