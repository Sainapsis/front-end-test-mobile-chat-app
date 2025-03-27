import React from 'react';
import { Pressable } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { ThemedView } from '@/design_system/components/atoms/ThemedView';
import { IconSymbol } from '@/design_system/ui/vendors';

import { Colors } from '@/constants/Colors';
import { SFSymbols6_0 } from 'sf-symbols-typescript';
import { styles } from './EmptyState.styles';

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