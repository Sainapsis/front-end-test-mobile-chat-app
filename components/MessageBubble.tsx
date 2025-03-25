import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Message } from "@/hooks/useChats";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MessageReactions } from './MessageReactions';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showFullImage, setShowFullImage] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageStatus = () => {
    if (!isCurrentUser) return null;

    const iconColor = isDark ? "#FFFFFF80" : "#00000080";
    const iconSize = 14;

    switch (message.status) {
      case "sent":
        return (
          <MaterialIcons 
            name="check" 
            size={iconSize} 
            color={iconColor} 
          />
        );
      case "delivered":
        return (
          <MaterialIcons 
            name="done-all" 
            size={iconSize} 
            color={iconColor} 
          />
        );
      case "read":
        return (
          <MaterialIcons 
            name="done-all" 
            size={iconSize} 
            color="#4CAF50" 
          />
        );
      default:
        return null;
    }
  };

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
        {message.messageType === "text" ? (
          <ThemedText
            style={[
              styles.messageText,
              isCurrentUser && !isDark && styles.selfMessageText,
            ]}
          >
            {message.text}
          </ThemedText>
        ) : (
          <View>
            <Pressable onPress={() => setShowFullImage(true)}>
              <Image
                source={{ uri: message.imagePreviewUri ?? message.imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </Pressable>
            {message.text && (
              <ThemedText
                style={[
                  styles.imageCaption,
                  isCurrentUser && !isDark && styles.selfMessageText,
                ]}
              >
                {message.text}
              </ThemedText>
            )}
          </View>
        )}
        <View style={styles.messageFooter}>
          <ThemedText style={styles.timeText}>
            {formatTime(message.timestamp)}
          </ThemedText>
          {renderMessageStatus()}
        </View>
      </View>

      <Modal
        visible={showFullImage}
        transparent={true}
        onRequestClose={() => setShowFullImage(false)}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={() => setShowFullImage(false)}
        >
          <Image
            source={{ uri: message.imageUri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>
      <MessageReactions messageId={message.id} reactions={message.reactions} />
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
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  imageCaption: {
    fontSize: 14,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "80%",
  },
});
