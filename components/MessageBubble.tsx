import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, Modal, Alert, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { Message } from "@/hooks/useChats";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MessageReactions } from './MessageReactions';
import { useAppContext } from "@/hooks/AppContext";
import { VoiceMessagePlayer } from "./VoiceMessagePlayer";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showFullImage, setShowFullImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const { editMessage, deleteMessage } = useAppContext();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleLongPress = () => {
    if (!isCurrentUser) return;

    Alert.alert(
      "Message Options",
      "What would you like to do?",
      [
        {
          text: "Edit",
          onPress: () => {
            setEditText(message.text);
            setIsEditing(true);
          },
        },
        {
          text: "Delete",
          onPress: () => {
            Alert.alert(
              "Delete Message",
              "Are you sure you want to delete this message?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => deleteMessage(message.id),
                },
              ]
            );
          },
          style: "destructive",
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleEditSubmit = async () => {
    if (editText.trim() === message.text) {
      setIsEditing(false);
      return;
    }

    const success = await editMessage(message.id, editText.trim());
    if (success) {
      setIsEditing(false);
    } else {
      Alert.alert("Error", "Failed to edit message");
    }
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
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

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return isEditing ? (
          <View>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={[
                styles.messageText,
                isCurrentUser && !isDark && styles.selfMessageText,
                styles.editInput,
                { backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF" }
              ]}
              multiline
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleEditSubmit}
            />
            <View style={styles.editButtons}>
              <TouchableOpacity 
                onPress={handleCancelEdit}
                style={[styles.editButton, styles.cancelButton]}
              >
                <ThemedText style={styles.editButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleEditSubmit}
                style={[styles.editButton, styles.saveButton]}
              >
                <ThemedText style={styles.editButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ThemedText
            style={[
              styles.messageText,
              isCurrentUser && !isDark && styles.selfMessageText,
            ]}
          >
            {message.text}
            {message.isEdited && (
              <ThemedText style={styles.editedText}> (edited)</ThemedText>
            )}
          </ThemedText>
        );
      
      case "image":
        return (
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
                {message.isEdited && (
                  <ThemedText style={styles.editedText}> (edited)</ThemedText>
                )}
              </ThemedText>
            )}
          </View>
        );

      case "voice":
        return (
          <View style={styles.voiceMessageContainer}>
            {message.voiceUri && message.voiceDuration && (
              <VoiceMessagePlayer
                uri={message.voiceUri}
                duration={message.voiceDuration}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (message.isDeleted) {
    return (
      <View style={[styles.container, isCurrentUser ? styles.selfContainer : styles.otherContainer]}>
        <View style={[styles.bubble, styles.deletedBubble]}>
          <ThemedText style={styles.deletedText}>
            This message was deleted
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={[
        styles.container,
        isCurrentUser ? styles.selfContainer : styles.otherContainer,
      ]}
      onLongPress={handleLongPress}
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
        {renderMessageContent()}
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
    </Pressable>
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
  editedText: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
  },
  deletedBubble: {
    backgroundColor: "#F0F0F0",
  },
  deletedText: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
  editInput: {
    padding: 8,
    minHeight: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#9E9E9E",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  voiceMessageContainer: {
    minWidth: 200,
  },
});
