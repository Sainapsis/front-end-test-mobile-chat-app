import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';

interface ReactionMenuProps {
    onReactionSelect: (reaction: string) => void;
    onRemoveReaction: () => void;
    currentReaction?: string;
}

const REACTIONS = ['❤️', '👍', '😊', '😂', '😮', '😢'];

export function ReactionMenu({ onReactionSelect, onRemoveReaction, currentReaction }: ReactionMenuProps) {
    return (
        <View style={styles.container}>
            <View style={styles.reactionsContainer}>
                {REACTIONS.map((reaction) => (
                    <Pressable
                        key={reaction}
                        style={[
                            styles.reactionButton,
                            currentReaction === reaction && styles.selectedReaction
                        ]}
                        onPress={() => onReactionSelect(reaction)}
                    >
                        <ThemedText style={styles.reactionText}>{reaction}</ThemedText>
                    </Pressable>
                ))}
            </View>
            {currentReaction && (
                <Pressable
                    style={styles.removeButton}
                    onPress={onRemoveReaction}
                >
                    <ThemedText style={styles.removeText}>Remove Reaction</ThemedText>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        //marginBottom: 8,
    },
    reactionButton: {
        padding: 4,
        borderRadius: "50%",
        backgroundColor: '#F0F0F0',
    },
    selectedReaction: {
        backgroundColor: '#E0E0E0',
    },
    reactionText: {
        fontSize: 20,
    },
    removeButton: {
        marginTop: 2,
        borderRadius: 9,
        alignItems: 'center',
    },
    removeText: {
        color: '#FF3B30',
        fontSize: 14,
    },
}); 