import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/design_system/ui/vendors';
import { ThemedText } from '@/design_system/components/atoms';
import { styles } from './ScreenHeader.styles';
import { colors } from '@/design_system/ui/tokens';

interface ScreenHeaderProps {
  /** Title to be displayed in the header */
  title: string;
  /** Function to be called when the back button is pressed */
  onBack?: () => void;
  /** Custom component to be displayed on the right side of the header */
  rightComponent?: React.ReactNode;
  /** Custom component to be displayed on the left side of the header */
  leftComponent?: React.ReactNode;
}

/**
 * ScreenHeader component provides a consistent header for screens.
 * It includes a title, optional back button, and custom left/right components.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightComponent,
  leftComponent,
}) => (
  <View style={styles.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <IconSymbol name="chevron.left" size={24} color={colors.primary.main} />
      </TouchableOpacity>
    ) : leftComponent}
    <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
      {title}
    </ThemedText>
    {rightComponent}
  </View>
);