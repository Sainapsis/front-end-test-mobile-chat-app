import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/design_system/components/atoms';
import { IconSymbol } from '@/design_system/ui/vendors';
import { styles } from './ListEmptyState.styles';
import { colors } from '@/design_system/ui/tokens';
import { SFSymbols6_0 } from 'sf-symbols-typescript'; 

interface ListEmptyStateProps {
  icon?: SFSymbols6_0; 
  message: string;
  description?: string;
}

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
