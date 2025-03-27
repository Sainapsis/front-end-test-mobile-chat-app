// TP
import React from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";

// BL
import { MessageInterface } from "@/lib/interfaces/Messages.interface";
import { useAppContext } from "@/lib/hooks/AppContext";
import { useChats } from "@/lib/hooks/useChats";
import formatParticipantInUserChats from "@/lib/helpers/formatParticipantInUserChats";

interface ExistingChatsModalProps {
  visible: boolean;
  message: MessageInterface;
  onClose: () => void;
}

const ExistingChatsModal = ({
  visible,
  onClose,
  message,
}: ExistingChatsModalProps) => {
  const { currentUser, users } = useAppContext();
  const { chats } = useChats(currentUser?.id || null);

  if (!currentUser) return null;

  const { forwardMessage } = useAppContext();

  const handleForwardMessage = async (chatId: string) => {
    await forwardMessage({
      senderId: currentUser?.id || "",
      targetUserId: message.senderId,
      targetChatId: chatId,
      messageId: message.id,
    });

    onClose();

    Toast.show({
      text1: "Message forwarded",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select a chat to forward</Text>
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={styles.chatItem}
                onPress={() => handleForwardMessage(item.id)}
              >
                <Text style={styles.chatName}>
                  {formatParticipantInUserChats({
                    chat: item,
                    currentUser,
                    users,
                  })}
                </Text>
              </Pressable>
            )}
          />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingVertical: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    height: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chatItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  chatName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeText: {
    color: "#007BFF",
    fontSize: 16,
  },
});

export default ExistingChatsModal;
