import { ThemedText } from "@/components/ui/text/ThemedText";
import { Colors } from "@/components/ui/themes/Colors";
import { useAppContext } from "@/hooks/AppContext";
import { Message } from "@/hooks/db";
import { useColorScheme, View, StyleSheet } from "react-native";

interface BubbleResponseProps{
    message: Message;
    isCurrentUser: boolean;
}
export function BubbleResponse({message, isCurrentUser}:BubbleResponseProps) {
    const {currentUser} = useAppContext();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    return (
        <View style={[styles.response, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(61,99,201,0.1)', borderColor: isDark ? '#FFF' : Colors.light.chatBubble.responseBorder }]}>
            <ThemedText style={[
                styles.messageText,
                styles.responseTitle
            ]}>{currentUser?.name === message.responseTo ? 'You' : message.responseTo}</ThemedText>
            <ThemedText style={[
                styles.messageText,
                isCurrentUser && !isDark && styles.selfMessageText
            ]}
            >{message.responseText}</ThemedText>
        </View>
    )
}

const styles = StyleSheet.create({
    messageText: {
      fontSize: 16,
      lineHeight: 18,
    },
    selfMessageText: {
      color: '#000000',
    },
    response: {
      width: 'auto',
      maxHeight: 80,
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
      borderLeftWidth: 5
    },
    responseTitle: {
      fontWeight: 600,
      marginBottom: 5,
    }
  }); 