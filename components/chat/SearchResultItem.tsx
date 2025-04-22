import { formatMessageDate } from '@/utils/dateUtils';
import { messageSearchStyles } from '@/styles/components/messageSearch.styles';
import { ThemedText } from '@/components/common/ThemedText';
import { View, Pressable } from 'react-native';
import React from 'react';
import { type SearchResult } from '@/hooks/useMessageSearch';

interface SearchResultItemProps {
    item: SearchResult;
    onPress: (chatId: string) => void;
    theme: any;
}

const SearchResultItem = React.memo(({ item, onPress, theme }: SearchResultItemProps) => (
    <Pressable
        style={[messageSearchStyles.resultItem, { borderBottomColor: theme.colors.border }]}
        onPress={() => onPress(item.chatId)}
        accessibilityRole="button"
        accessibilityLabel={`Message from ${item.chatName} at ${formatMessageDate(item.timestamp)}`}
    >
        <View style={messageSearchStyles.resultContent}>
            <View style={messageSearchStyles.messageInfo}>
                <ThemedText style={messageSearchStyles.chatName}>
                    {item.chatName}
                </ThemedText>
                <ThemedText style={[messageSearchStyles.timestamp, { color: theme.colors.textSecondary }]}>
                    {formatMessageDate(item.timestamp)}
                </ThemedText>
            </View>
            <ThemedText
                style={[messageSearchStyles.messageText, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
            >
                {item.text}
            </ThemedText>
        </View>
    </Pressable>
));

export default SearchResultItem;
