/**
 * ReactionMenu Component
 * 
 * A component that displays a menu of available reactions and allows users to select or remove
 * reactions on messages. It provides a set of predefined reactions and handles the selection
 * and removal of reactions through callbacks.
 * 
 * Features:
 * - Displays a grid of predefined reactions
 * - Highlights the currently selected reaction
 * - Provides a remove reaction option
 * - Supports theme integration
 * - Responsive layout with wrapping
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './ThemedText';

/**
 * Props interface for the ReactionMenu component
 * 
 * @property onReactionSelect - Callback function when a reaction is selected
 * @property onRemoveReaction - Callback function to remove the current reaction
 * @property currentReaction - The currently selected reaction, if any
 */
interface ReactionMenuProps {
    onReactionSelect: (reaction: string) => void;
    onRemoveReaction: () => void;
    currentReaction?: string;
}

/**
 * Available reactions that can be selected
 * 
 * @constant REACTIONS - Array of emoji reactions
 */
const REACTIONS = ['❤️', '👍', '😊', '😂', '😮', '😢'];

/**
 * ReactionMenu Component Implementation
 * 
 * Renders a menu of reactions with the following features:
 * - Displays a grid of available reactions
 * - Highlights the currently selected reaction
 * - Shows a remove button when a reaction is selected
 * - Handles reaction selection and removal through callbacks
 */
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

/**
 * Component styles
 * 
 * Defines the layout and appearance of the reaction menu:
 * - Container styling with shadow and elevation
 * - Reaction button layout and appearance
 * - Selected reaction highlighting
 * - Remove button styling
 * - Consistent spacing and padding
 */
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