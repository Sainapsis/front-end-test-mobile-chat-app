import React from 'react';
import { Button, StyleSheet, View, Alert } from 'react-native';
import { resetDatabase } from '../database/db';
import { seedDatabase } from '../database/seed';

interface DatabaseResetProps {
    onReset?: () => void;
}

export default function DatabaseReset({ onReset }: DatabaseResetProps) {
    const handleReset = async () => {
        Alert.alert(
            "Reset Database",
            "Are you sure you want to reset the database to its initial state? This will delete all messages and chats.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Show loading message
                            Alert.alert("Resetting", "Resetting database...");

                            // Reset the database
                            const success = await resetDatabase();

                            if (success) {
                                // Reseed the database with initial data
                                await seedDatabase();

                                // Notify user
                                Alert.alert("Success", "Database has been reset to its initial state. Please restart the app for changes to take effect.");

                                // Call the onReset callback if provided
                                if (onReset) {
                                    onReset();
                                }
                            } else {
                                Alert.alert("Error", "Failed to reset database. Please try again.");
                            }
                        } catch (error) {
                            console.error("Error resetting database:", error);
                            Alert.alert("Error", "An error occurred while resetting the database.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Button
                title="Reset Database"
                onPress={handleReset}
                color="#FF3B30"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 8,
        margin: 5,
    }
}); 