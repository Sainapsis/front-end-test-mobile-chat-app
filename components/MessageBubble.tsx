import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Message } from "@/utils/types";
import { ImageMessage } from "./ImageMessage";
import { MessageReactions } from "./MessageReactions";
import { MessageOptions } from "./MessageOptions";
import { IconSymbol } from "./ui/IconSymbol";
import { useTheme } from "../hooks/theme/useTheme";
import { MessageStatus } from "./ui/MessageStatus";
import { VoiceMessage } from "./VoiceMessage";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onForwardMessage: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isOwnMessage,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
  onForwardMessage,
}: MessageBubbleProps) {
  const { colors } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const bubbleStyle = [
    styles.bubble,
    { backgroundColor: isOwnMessage ? colors.ownBubble : colors.bubble },
  ];
  const textStyle = { color: isOwnMessage ? "#FFFFFF" : colors.text };

  const handleLongPress = () => {
    if (isOwnMessage) {
      setShowOptions(true);
    }
  };

  const handleEdit = () => {
    setShowOptions(false);
    setIsEditing(true);
  };

  const handleDelete = () => {
    setShowOptions(false);
    onDeleteMessage(message.id);
  };

  const handleForward = () => {
    setShowOptions(false);
    onForwardMessage(message.id);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEditMessage(message.id, editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text || "");
    setIsEditing(false);
  };

  const transformTimestampToTime = (timestamp: number) => {
    const date = new Date(timestamp);

    const hours = date.getHours() % 12 || 12; // Convierte 0 en 12
    const minutes = date.getMinutes();
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return `${hours}:${minutes} ${ampm}`;
  };
  const renderMessageContent = () => {
    if (isEditing) {
      return (
        <View>
          <TextInput
            style={[
              styles.editInput,
              {
                backgroundColor: colors.editInputBackground,
                color: colors.editInputText,
              },
            ]}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
            placeholder="Editar mensaje..."
            placeholderTextColor={colors.editInputPlaceholder}
          />
          <View style={styles.editActions}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <IconSymbol name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveEdit}>
              <IconSymbol name="checkmark" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <>
        {message.mediaUrl && message.mediaType === 'image' && (
          <ImageMessage
            uri={message.mediaUrl}
            thumbnailUri={message.mediaThumbnail || message.mediaUrl}
            isOwnMessage={isOwnMessage}
          />
        )}
        {message.voiceUrl && message.voiceDuration && message.isVoiceMessage && (
          <VoiceMessage
            uri={message.voiceUrl}
            duration={message.voiceDuration}
            isOwnMessage={isOwnMessage}
          />
        )}
        {message.text && (
          <Text style={[styles.text, textStyle]}>{message.text}</Text>
        )}
      </>
    );
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      <View
        style={
          isOwnMessage ? styles.messageWrapperLeft : styles.messageWrapperRight
        }
      >
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.forwardButton}
            onPress={handleForward}
          >
            <IconSymbol
              name="arrow.right"
              size={16}
              color={colors.reactionCount}
            />
          </TouchableOpacity>
          <MessageReactions
            reactions={message.reactions || []}
            currentUserId={currentUserId}
            onAddReaction={(emoji) => onAddReaction(message.id, emoji)}
            onRemoveReaction={onRemoveReaction}
            isOwnMessage={isOwnMessage}
          />
        </View>
        <TouchableOpacity style={bubbleStyle} onLongPress={handleLongPress}>
          {renderMessageContent()}
          <View style={styles.messageInfo}>
            <Text style={[styles.text, textStyle]}>{transformTimestampToTime(message.timestamp)}</Text>
            <MessageStatus
              status={message.status}
              isOwnMessage={isOwnMessage}
            />
          </View>
        </TouchableOpacity>
      </View>

      <MessageOptions
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isOwnMessage={isOwnMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  ownContainer: {
    alignSelf: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
  },
  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  messageWrapperRight: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    gap: 4,
  },
  messageWrapperLeft: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  bubble: {
    padding: 12,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  messageActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  messageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  forwardButton: {
    padding: 4,
  },
});
