import React, { useRef, useEffect, memo, useMemo, useCallback } from "react";
import { ThemedView } from "@/components/ui/layout/ThemedView";
import { ThemedText } from "@/components/ui/text/ThemedText";
import { Chat, Message } from "@/hooks/db";
import { Dispatch, SetStateAction } from "react";
import { FlatList, Keyboard, Platform, StyleSheet, View, ViewToken, Animated } from "react-native";
import { DateBadge } from "./DateBadge";
import { MessageBubble } from "./MessageBubble";
import { useAppContext } from "@/hooks/AppContext";
import { formatDateLabel } from "./utils/DateFormatter";

// Define the props for the MessagesList component.
// - chat: The chat object that contains messages and other chat details.
// - setHeaderDate: A function to update the header date in the parent component.
interface MessagesListProps {
    chat: Chat;
    setHeaderDate: Dispatch<SetStateAction<number>>;
    onSwapMessage: (message: Message) => void;
}

// Define the props for the MessageGroup component.
// This component renders a single message along with a DateBadge if needed.
interface MessageGroupProps {
    item: any;
    index: number;
    messagesList: any[];
    currentUser: any;
    onSwapMessage: (message: Message) => void;
}

// MessageGroup is memoized to prevent unnecessary re-renders when its props do not change.
const MessageGroup = memo(({ item, index, messagesList, currentUser, onSwapMessage }: MessageGroupProps) => {
    // Format the current message's timestamp to get a readable date label.
    const currentMessageTime = formatDateLabel(item.timestamp);
    let showBadge = false;
    if (index === 0) {
        // Always show a date badge for the first message.
        showBadge = true;
    } else {
        // For subsequent messages, compare the current message's date label with the previous message's.
        const previousMessage = messagesList[index - 1];
        const previousMessageTime = formatDateLabel(previousMessage.timestamp);
        // If the date labels differ, show a date badge.
        if (currentMessageTime !== previousMessageTime) {
            showBadge = true;
        }
    }

    return (
        <View>
            {/* Conditionally render the DateBadge if required */}
            {showBadge && <DateBadge timestamp={item.timestamp} />}
            {/* Render the message bubble with properties based on the sender */}

            <MessageBubble
                message={item}
                isCurrentUser={item.senderId === currentUser?.id}
                onSwapMessage={onSwapMessage}
            />
        </View>
    );
});

// MessagesList component renders the entire list of messages with date badges.
export function MessagesList({ chat, setHeaderDate, onSwapMessage }: MessagesListProps) {
    const { currentUser, messageIdToScroll, setMessageId } = useAppContext();
    const flatListRef = useRef<FlatList>(null);
    const messagesList = useMemo(() => chat.messages || [], [chat.messages]);

    const scrollToEnd = useCallback((animated = true) => {
        if(!messageIdToScroll)
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToEnd({ animated });
        });
    }, []);

    const handleContentSizeChange = useCallback(() => {
        if (messagesList.length > 0) {
            scrollToEnd();
        }
    }, [messagesList.length, scrollToEnd]);
    // Effect to scroll to the bottom when the keyboard appears.
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            scrollToEnd(Platform.OS === 'ios');
        });
        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);
    // Callback to update the header date based on the first visible message.
    const onViewableItemsChanged = useRef(
        ({ viewableItems, changed }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
            if (viewableItems.length > 0) {
                const firstItem = viewableItems[0].item;
                // Update the header date in the parent component.
                setHeaderDate(firstItem.timestamp);
            }
        }
    ).current;

    useEffect(() => {        
        if (messageIdToScroll && chat.messages) {
          const targetIndex = chat.messages.findIndex(msg => msg.id === messageIdToScroll);
          
          if (targetIndex !== -1) {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: targetIndex,
                viewPosition: 0.5, 
                animated: true
              });
            }, 300);
          }
          
          setMessageId(undefined);
        }
      }, [messageIdToScroll, chat.messages]); 

    const viewabilityConfig = { itemVisiblePercentThreshold: 20 };

    return (
        <FlatList
            ref={flatListRef}
            data={chat.messages}
            keyExtractor={(item) => item.id}
            // Use the memoized MessageGroup component for each item.
            renderItem={({ item, index }) => (
                <MessageGroup
                    item={item}
                    index={index}
                    messagesList={messagesList}
                    currentUser={currentUser}
                    onSwapMessage={onSwapMessage}
                />
            )}
            contentContainerStyle={styles.messagesContainer}
            ListEmptyComponent={() => (
                <ThemedView style={styles.emptyContainer}>
                    <ThemedText>No messages yet. Say hello! {chat.chatStatus}</ThemedText>
                </ThemedView>
            )}
            // When the content size changes, automatically scroll to the bottom.
            onContentSizeChange={handleContentSizeChange}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onScrollToIndexFailed={({ index, averageItemLength }) => {
                const offset = index * averageItemLength;
                flatListRef.current?.scrollToOffset({ offset, animated: false });
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({ index });
                }, 100);
              }}
        />
    );
}

const styles = StyleSheet.create({
    messagesContainer: {
        padding: 10,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
