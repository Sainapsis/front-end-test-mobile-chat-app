import React from 'react';
import { StyleSheet } from 'react-native';
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
}

export function EmptyState({ icon, title, message, color }: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <IconSymbol size={64} name={icon} color={color || Colors.light.tint} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
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
  },
});