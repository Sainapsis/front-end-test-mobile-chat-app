import { FlatList, StyleSheet } from "react-native";
import { ChatListItem } from "./ChatListItem";
import { Chat, User } from "@/hooks/db";

interface ChatListProps {
    chats: Chat[];
    currentUser?: User;
    users: User[];
    renderEmptyComponent: () => React.ReactNode;
}
export function ChatList({ chats, currentUser, users, renderEmptyComponent }: ChatListProps) {
    return (
        <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <ChatListItem
                    chat={item}
                    currentUserId={currentUser?.id || ''}
                    users={users}
                />
            )}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.listContainer}
        />
    )
}

const styles = StyleSheet.create({
    listContainer: {
        flexGrow: 1,
      },
})