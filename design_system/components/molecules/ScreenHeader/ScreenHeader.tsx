import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/design_system/ui/vendors';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './ScreenHeader.styles';
import { colors } from '@/design_system/ui/tokens';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightComponent,
  leftComponent,
}) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={24} color={colors.primary[500]} />
      </TouchableOpacity>
    ) : leftComponent}
    <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
      {title}
    </ThemedText>
    {rightComponent}
  </View>
);