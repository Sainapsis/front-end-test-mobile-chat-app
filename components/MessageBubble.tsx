// TP
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";

// BL
import { useColorScheme } from "@/hooks/useColorScheme";
import { MessageBubbleProps } from "@/interfaces/Messages.interface";
import { useChats } from "@/hooks/useChats";
import { formatTimeTo2HourDigit } from "@/bl/helpers/formatTimeTo2HourDigit";

// UI
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol.ios";

export function MessageBubble({
  message,
  isCurrentUser,
  chatId,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { setMessageAsRead } = useChats(message.senderId);

  useEffect(() => {
    if (!isCurrentUser && message.status === "sent") {
      setMessageAsRead({ id: message.id, chatId });
    }
  }, [message]);

  const isMessageRead = message.status === "read" && isCurrentUser;

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.selfContainer : styles.otherContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser
            ? [
                styles.selfBubble,
                { backgroundColor: isDark ? "#235A4A" : "#DCF8C6" },
              ]
            : [
                styles.otherBubble,
                { backgroundColor: isDark ? "#2A2C33" : "#FFFFFF" },
              ],
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ThemedText
            style={[
              styles.messageText,
              isCurrentUser && !isDark && styles.selfMessageText,
            ]}
          >
            {message.text}
          </ThemedText>
          {isCurrentUser &&
            (isMessageRead ? (
              <IconSymbol
                size={15}
                name="checkmark.message.fill"
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            ) : (
              <IconSymbol
                size={15}
                name="checkmark.message"
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            ))}
        </View>
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
            {formatTimeTo2HourDigit(message.timestamp)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  selfContainer: {
    alignSelf: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: "#000000",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
});
