// TP
import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native";

// UI
import { ThemedText } from "../ThemedText";


interface MessageOptionsProps {
  handleDeleteMessage: () => void;
  setShowInputToEditMessage: (show: boolean) => void;
  setShowMessageOptions: (show: boolean) => void;
}


const MessageOptions = ({
  handleDeleteMessage,
  setShowInputToEditMessage,
  setShowMessageOptions,
}: MessageOptionsProps) => {
  return (
    <View style={styles.messageOptions}>
      <Pressable
        onPress={handleDeleteMessage}
        style={styles.messageOptionsItem}
      >
        <ThemedText
          style={[
            styles.messageOptionsText,
            { color: "red", fontWeight: "bold" },
          ]}
        >
          Delete
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => {
          setShowInputToEditMessage(true);
          setShowMessageOptions(false);
        }}
        style={[
          styles.messageOptionsItem,
          { borderTopColor: "red", borderTopWidth: 1 },
        ]}
      >
        <ThemedText style={styles.messageOptionsText}>Edit</ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  messageOptions: {
    position: "absolute",
    top: 40,
    zIndex: 10,
    right: 0,
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
    bottom: 0,
    height: 70,
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "red",
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
  },
  messageOptionsText: {
    fontSize: 14,
    textAlign: "center",
  },
  messageOptionsItem: {
    width: "100%",
    display: "flex",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MessageOptions;
