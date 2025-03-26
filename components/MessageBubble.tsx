// TP
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import Animated, {
  interpolateColor,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  runOnJS,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

// BL
import { useColorScheme } from "@/hooks/useColorScheme";
import { MessageBubbleProps } from "@/interfaces/Messages.interface";
import { useChats } from "@/hooks/useChats";
import { useAppContext } from "@/hooks/AppContext";
import { formatTimeTo2HourDigit } from "@/helpers/formatTimeTo2HourDigit";

// UI
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol.ios";
import EditableMessageInput from "./EditableMessageInput";
import MessageOptions from "./MessageOptions";
import ExistingChatsModal from "./organisms/ExistingChatsModal/ExistingChatsModal";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { withSpring } from "react-native-reanimated";
import EmojisToReact from "./EmojisToReact";

export function MessageBubble({
  message,
  isCurrentUser,
  chatId,
}: MessageBubbleProps) {
  const { deleteMessage, editMessage, addReactionToMessage } = useAppContext();
  const { setMessageAsRead } = useChats(message.senderId);
  const colorScheme = useColorScheme();

  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showInputToEditMessage, setShowInputToEditMessage] = useState(false);
  const [messageTextToEdit, setMessageTextToEdit] = useState(message.text);
  const [showExistingChatsModal, setShowExistingChatsModal] = useState(false);
  const isDark = colorScheme === "dark";
  const isMessageRead = message.status === "read" && isCurrentUser;

  useEffect(() => {
    if (!isCurrentUser && message.status === "sent") {
      setMessageAsRead({ id: message.id, chatId });
    }
  }, [message]);

  const handleDeleteMessage = async () => {
    Alert.alert(
      "Delete message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMessage({ chatId, messageId: message.id });
            Toast.show({
              text1: "Message deleted",
              type: "success",
              position: "top",
            });
          },
        },
      ]
    );
  };

  const handleEditMessage = async () => {
    await editMessage({
      chatId,
      messageId: message.id,
      newText: messageTextToEdit,
    });
    setShowInputToEditMessage(false);
    Toast.show({
      text1: "Message edited",
      type: "success",
    });
  };

  const position = useSharedValue(0);
  const threshold = 100;

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) {
        position.value = e.translationX; // Solo permite mover hacia la derecha
      }
    })
    .onEnd(() => {
      if (position.value > threshold) {
        runOnJS(setShowExistingChatsModal)(true);
      }
      position.value = withSpring(0, { damping: 15, stiffness: 120 }); // Regresa suavemente a la posición original
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  const [showEmojisToReact, setShowEmojisToReact] = useState(false);

const scale = useSharedValue(0);

useEffect(() => {
  if (message.reaction) {
    scale.value = withSpring(1); // Animación suave al aparecer
  } else {
    scale.value = withSpring(0); // Animación suave al desaparecer
  }
}, [message.reaction]);

const animatedStyleEmoji = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: scale.value,
}));

console.log(message);

return (
  <KeyboardAvoidingView keyboardVerticalOffset={100} behavior="padding">
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle]}>
        <Pressable
          onLongPress={() => {
            if (isCurrentUser) {
              setShowMessageOptions(!showMessageOptions);
            } else {
              setShowEmojisToReact(true);
            }
          }}
          onPress={() => {
            if (isCurrentUser) {
              setShowMessageOptions(false);
            }
            setShowEmojisToReact(false);
          }}
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
              {showInputToEditMessage ? (
                <EditableMessageInput
                  prevMessageText={message.text}
                  messageTextToEdit={messageTextToEdit}
                  setMessageTextToEdit={setMessageTextToEdit}
                  setShowInputToEditMessage={setShowInputToEditMessage}
                  handleEditMessage={handleEditMessage}
                />
              ) : (
                <ThemedText
                  style={[
                    styles.messageText,
                    isCurrentUser && !isDark && styles.selfMessageText,
                  ]}
                >
                  {message.text}
                </ThemedText>
              )}

              {isCurrentUser && (
                <IconSymbol
                  style={{ alignSelf: "flex-start" }}
                  size={15}
                  name={
                    isMessageRead
                      ? "checkmark.message.fill"
                      : "checkmark.message"
                  }
                  color={isDark ? "#FFFFFF" : "#000000"}
                />
              )}
            </View>
            <View style={styles.timeContainer}>
              <ThemedText style={styles.timeText}>
                {formatTimeTo2HourDigit(message.timestamp)}
              </ThemedText>
            </View>
            {message.reaction && (
              <Animated.View
                style={[
                  {
                    backgroundColor: isCurrentUser ? "#DCF8C6" : "white",
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 10,
                    position: "absolute",
                    bottom: -10,
                    left: 0,
                  },
                  animatedStyleEmoji,
                ]}
              >
                <Pressable>
                  <ThemedText>{message.reaction}</ThemedText>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
    {showMessageOptions && (
      <MessageOptions
        handleDeleteMessage={handleDeleteMessage}
        setShowInputToEditMessage={setShowInputToEditMessage}
        setShowMessageOptions={setShowMessageOptions}
      />
    )}
    {showEmojisToReact && (
      <EmojisToReact
        handleReaction={(e) => {
          addReactionToMessage({
            chatId,
            messageId: message.id,
            reaction: e,
          });
        }}
        setShowReactions={setShowEmojisToReact}
      />
    )}
    <ExistingChatsModal
      message={message}
      visible={showExistingChatsModal}
      onClose={() => setShowExistingChatsModal(false)}
    />
  </KeyboardAvoidingView>
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
