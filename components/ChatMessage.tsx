import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSync } from "../hooks/useSync";

interface ChatMessageProps {
  id: string;
  text: string;
  timestamp: number;
  isMine: boolean;
  isPending?: boolean;
}

export default function ChatMessage({
  id,
  text,
  timestamp,
  isMine,
  isPending = false,
}: ChatMessageProps) {
  const { isOnline } = useSync();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Determine message status icon
  const getStatusIcon = () => {
    if (isPending) {
      return <Ionicons name="time-outline" size={12} color="#999" />;
    }

    if (!isOnline) {
      return <Ionicons name="checkmark" size={12} color="#999" />;
    }

    return <Ionicons name="checkmark-done" size={12} color="#4caf50" />;
  };

  return (
    <View
      style={[
        styles.container,
        isMine ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{text}</Text>
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        {isMine && (
          <View style={styles.statusContainer}>{getStatusIcon()}</View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "80%",
    borderRadius: 12,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#dcf8c6",
    marginLeft: 40,
    marginRight: 10,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    marginRight: 40,
    marginLeft: 10,
  },
  messageText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    marginRight: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
