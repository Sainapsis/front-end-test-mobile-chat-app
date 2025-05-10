import { FlatList, StyleSheet, ViewStyle } from "react-native";
import { ChatListItem } from "./ChatListItem";
import { Chat, User } from "@/hooks/db";

interface ChatListProps {
    chats: Chat[];
    currentUser?: User;
    renderEmptyComponent?: () => React.ReactNode;
    style?: ViewStyle;
    scrollEnabled?: boolean; 
}
export function ChatList({ chats, currentUser, renderEmptyComponent, style, scrollEnabled = true}: ChatListProps) {
    return (
        <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ChatListItem
                    chat={item}
                    currentUserId={currentUser?.id || ''}
                />
            )}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={[styles.listContainer, style]}
            scrollEnabled={scrollEnabled}
        />
    )
}

const styles = StyleSheet.create({
    listContainer: {
        flexGrow: 1,
      },
})