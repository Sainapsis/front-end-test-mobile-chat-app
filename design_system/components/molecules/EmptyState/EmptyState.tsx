import React from 'react';
import { ThemedText } from '@/design_system/components/atoms/ThemedText';
import { ThemedView } from '@/design_system/components/atoms/ThemedView';
import { IconSymbol } from '@/design_system/ui/vendors';
import { themes as Colors } from '@/design_system/ui/tokens/colors';
import { SFSymbols6_0 } from 'sf-symbols-typescript';
import { styles } from './EmptyState.styles';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EmptyStateProps {
  /** Icon to be displayed in the empty state */
  icon: SFSymbols6_0;
  /** Title of the empty state */
  title: string;
  /** Message to be displayed in the empty state */
  message: string;
  /** Custom color for the icon */
  color?: string;
}

/**
 * EmptyState component is used to display a placeholder when there is no content to show.
 * It includes an icon, a title, and a message to guide the user.
 */
export function EmptyState({ 
  icon, 
  title, 
  message, 
  color, 
}: EmptyStateProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={styles.container}>
      <IconSymbol size={64} name={icon} color={color || Colors.light.tint} />
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={[theme === 'light' ? {color: Colors.light.text.secondary} : {color:Colors.dark.text.secondary},styles.message]}>{message}</ThemedText>
    </ThemedView>
  );
}