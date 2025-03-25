import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, useColorScheme as RNUseColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type EmptyStateType = 'chat' | 'message';

interface EmptyStateViewProps {
    type: EmptyStateType;
    title: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    image?: any;
    actionText?: string;
    onAction?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
    type,
    title,
    message,
    icon,
    image,
    actionText,
    onAction,
}) => {
    const colorScheme = RNUseColorScheme() === 'dark' ? 'dark' : 'light';
    const theme = Colors[colorScheme];

    const renderIllustration = () => {
        if (image) {
            return <Image source={image} style={styles.image} />;
        }

        if (icon) {
            return (
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={icon}
                        size={80}
                        color={theme.secondary}
                    />
                </View>
            );
        }

        // Ilustraciones por defecto basadas en el tipo
        if (type === 'chat') {
            return (
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="chatbubbles-outline"
                        size={80}
                        color={theme.secondary}
                    />
                </View>
            );
        }

        if (type === 'message') {
            return (
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={80}
                        color={theme.secondary}
                    />
                </View>
            );
        }

        return null;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                {renderIllustration()}
                <ThemedText style={styles.title}>{title}</ThemedText>
                {message && <ThemedText style={styles.message}>{message}</ThemedText>}
                {actionText && onAction && (
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: theme.secondary },
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={onAction}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={actionText}
                        accessibilityHint={`Pulsa para ${actionText.toLowerCase()}`}
                    >
                        <Text style={styles.actionText}>{actionText}</Text>
                    </Pressable>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: '80%',
    },
    iconContainer: {
        marginBottom: 20,
        padding: 20,
        borderRadius: 50,
        backgroundColor: 'rgba(150, 150, 150, 0.1)',
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.7,
    },
    actionButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 10,
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 