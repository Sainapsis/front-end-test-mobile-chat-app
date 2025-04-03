// TP
import {
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { Pressable } from "react-native";

// UI
import { ThemedText } from "../atoms/ThemedText";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { Colors } from "@/UI/constants/Colors";

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
  const ref = useRef<View>(null);
  const theme = useColorScheme() ?? "light";

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    pageX: 0,
    pageY: 0,
  });

  useEffect(() => {
    if (ref.current) {
      ref.current.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number
        ) => {
          setPosition({ x, y, width, height, pageX, pageY });
        }
      );
    }
  }, [ref]);

  return (
    <View
      ref={ref}
      style={[
        styles.messageOptions,
        {
          ...(position.pageY > 670
            ? {
                top: 0,
                left: position.pageX - 100,
              }
            : {
                top: 40,
                right: 0,
                bottom: 0,
              }),
        },
      ]}
    >
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
        <ThemedText style={[styles.messageOptionsText]}>Edit</ThemedText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  messageOptions: {
    position: "absolute",
    zIndex: 10,
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
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
    color: "black",
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
