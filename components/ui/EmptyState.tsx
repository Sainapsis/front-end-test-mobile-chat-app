import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { SFSymbols6_0 } from 'sf-symbols-typescript';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface EmptyStateProps {
  icon: SFSymbols6_0;
  title: string;
  message: string;
  color?: string;
  onClear?: () => void;
  showClearButton?: boolean;
}

export function EmptyState({ 
  icon, 
  title, 
  message, 
  color, 
  onClear, 
  showClearButton = false 
}: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <IconSymbol size={64} name={icon} color={color || Colors.light.tint} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {showClearButton && onClear && (
        <Pressable style={styles.clearButton} onPress={onClear}>
          <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    maxWidth: '80%',
    marginBottom: 20,
  },
  clearButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});