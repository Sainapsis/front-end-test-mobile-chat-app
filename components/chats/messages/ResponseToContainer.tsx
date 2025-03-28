import { IconSymbol } from "@/components/ui/icons/IconSymbol";
import { ThemedView } from "@/components/ui/layout/ThemedView";
import { ThemedText } from "@/components/ui/text/ThemedText";
import { Colors } from "@/components/ui/themes/Colors";
import { useAppContext } from "@/hooks/AppContext";
import { StyleSheet, useColorScheme, View } from 'react-native'

interface ResponseToContainerProps {
    response: string;
    responseTo: string;
}

export function ResponseToContainer({response, responseTo}: ResponseToContainerProps) {
    const {currentUser} = useAppContext();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    return (
        <ThemedView style={[styles.responseContainer, { borderColor: isDark ? '#FFF' : Colors.light.chatBubble.responseBorder }]}>
            <View>
                <ThemedText style={[styles.responseText, styles.responseTitle]}>{currentUser?.name === responseTo? 'You': responseTo}</ThemedText>
                <ThemedText style={styles.responseText}>{response}</ThemedText>
            </View>
            <View style={styles.cancelButton}>
                <IconSymbol name="xmark" size={20} color="#007AFF" />
            </View>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    responseContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderLeftWidth: 6
    },
    messagesContainer: {
        padding: 10,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    responseText: {
        fontSize: 16,
        lineHeight: 18,
    },
    responseTitle: {
        fontWeight: 600,
        marginBottom: 5,
    },
    cancelButton:{
        marginRight: 10,
    }
});