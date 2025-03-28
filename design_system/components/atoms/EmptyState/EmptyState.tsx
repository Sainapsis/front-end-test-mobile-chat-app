import React from 'react';
import { Pressable } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { ThemedView } from '@/design_system/components/atoms/ThemedView';
import { IconSymbol } from '@/design_system/ui/vendors';

import { colors as Colors } from '@/design_system/ui/tokens/colors';
import { SFSymbols6_0 } from 'sf-symbols-typescript';
import { styles } from './EmptyState.styles';

interface EmptyStateProps {
  icon: SFSymbols6_0;
  title: string;
  message: string;
  color?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  message, 
  color, 
}: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <IconSymbol size={64} name={icon} color={color || Colors.light.tint} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      
    </ThemedView>
  );
}