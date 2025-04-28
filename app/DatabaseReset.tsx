import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useDatabaseStatus } from '../database/DatabaseProvider';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/styles/DatabaseResetStyles';

export function DatabaseReset() {
  const { resetDatabase } = useDatabaseStatus();
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const handleReset = async () => {
    try {
      await resetDatabase();
      console.log('Database reset successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.card, { borderColor }]}>
        <ThemedText style={styles.title}>Database Reset</ThemedText>
        <ThemedText style={styles.description}>
          This will reset the database to its initial state. All messages and chats will be cleared.
        </ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: 'red' }]} 
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, { color: 'white' }]}>Reset Database</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}