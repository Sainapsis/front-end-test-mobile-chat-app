import { FlatList, StyleSheet } from "react-native";
import { Message, User } from "@/hooks/db";
import { FilteredMessageListItem } from "./FilteredMessageListItem";

interface FilteredMessageListProps {
    messages: Message[];
    currentUser?: User;
    renderEmptyComponent?: () => React.ReactNode;
    scrollEnabled?: boolean; 
}
export function FilteredMessageList({ messages, currentUser, renderEmptyComponent, scrollEnabled = true }: FilteredMessageListProps) {
    return (
        <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <FilteredMessageListItem
                    message={item}
                    currentUserId={currentUser?.id || ''}
                />
            )}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={scrollEnabled}
        />
    )
}

const styles = StyleSheet.create({
    listContainer: {
        flexGrow: 1,
      },
})