import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles } from './ListEmptyState.styles';
import { colors } from '@/design_system/ui/tokens';
import { SFSymbols6_0 } from 'sf-symbols-typescript'; 

interface ListEmptyStateProps {
  /** Optional icon to be displayed */
  icon?: SFSymbols6_0; 
  /** Main message to be displayed */
  message: string;
  /** Optional description text */
  description?: string;
}

/**
 * ListEmptyState component is used to display a placeholder when a list is empty.
 * It can include an icon, a main message, and an optional description.
 */
export const ListEmptyState: React.FC<ListEmptyStateProps> = ({
  icon,
  message,
  description,
}) => (
  <View style={styles.container}>
    {icon && <IconSymbol name={icon} size={48} color={colors.neutral[400]} />}
    <ThemedText type="subtitle" style={styles.message}>{message}</ThemedText>
    {description && (
      <ThemedText style={styles.description}>{description}</ThemedText>
    )}
  </View>
);
