// TP
import {
  KeyboardAvoidingView,
  TextInput,
  View,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";

// BL
import { ThemedText } from "../atoms/ThemedText";
import { Colors } from "../../constants/Colors";

interface EditableMessageInputProps {
  messageTextToEdit: string;
  setMessageTextToEdit: (text: string) => void;
  setShowInputToEditMessage: (show: boolean) => void;
  handleEditMessage: () => void;
  prevMessageText: string;
}

const EditableMessageInput = ({
  messageTextToEdit,
  setMessageTextToEdit,
  setShowInputToEditMessage,
  handleEditMessage,
  prevMessageText,
}: EditableMessageInputProps) => {
  const theme = useColorScheme() ?? "light";

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={100}
      behavior="padding"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <TextInput
        multiline
        numberOfLines={2}
        onChangeText={(text) => setMessageTextToEdit(text)}
        style={[styles.editMessageInput, { color: Colors[theme].text }]}
        value={messageTextToEdit}
        placeholderTextColor={Colors[theme].text}
      />
      <View
        style={{ flexDirection: "row", justifyContent: "flex-end", gap: 5 }}
      >
        <Pressable
          style={[styles.editMessageButtons, { backgroundColor: "#f5a4a4" }]}
          onPress={() => {
            setShowInputToEditMessage(false);
            setMessageTextToEdit(prevMessageText);
          }}
        >
          <ThemedText style={{ fontSize: 12, color: "black" }}>
            Cancel
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.editMessageButtons, { backgroundColor: "#94eb8a" }]}
          onPress={handleEditMessage}
        >
          <ThemedText style={{ fontSize: 12, color: "black" }}>
            Confirm
          </ThemedText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditableMessageInput;

const styles = StyleSheet.create({
  editMessageInput: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    padding: 5,
    width: "auto",
    maxHeight: 100,
    borderRadius: 5,
    fontSize: 16,
    borderBottomRightRadius: 0,
  },
  editMessageButtons: {
    backgroundColor: "#f5a4a4",
    width: 60,
    height: 30,
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
});
