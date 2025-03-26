// TP
import { StyleSheet, View } from "react-native";
import { Pressable } from "react-native";

// BL
import { EmojisToReactProps } from "@/interfaces/Messages.interface";

// UI
import { ThemedText } from "./ThemedText";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MessageReactions = ({
  handleReaction,
  setShowReactions,
}: EmojisToReactProps) => {
  return (
    <View style={styles.reactionsContainer}>
      {reactions.map((reaction) => (
        <Pressable
          key={reaction}
          onPress={() => {
            handleReaction(reaction);
            setShowReactions(false);
          }}
          style={styles.reactionItem}
        >
          <ThemedText style={styles.reactionText}>{reaction}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  reactionsContainer: {
    position: "absolute",
    bottom: -40,
    zIndex: 10,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  reactionItem: {
    padding: 8,
  },
  reactionText: {
    fontSize: 20,
  },
});

export default MessageReactions;
