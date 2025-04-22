// Nuevo archivo: components/MessageStatus.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/theme/useTheme';

interface MessageStatusProps {
  status: "sending" | "sent" | "delivered" | "read";
  isOwnMessage: boolean;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ 
  status, 
  isOwnMessage 
}) => {
  const { colors } = useTheme();

  if (!isOwnMessage) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Ionicons name="time-outline" size={16} color={colors.text} />;
      case 'sent':
        return <Ionicons name="checkmark" size={16} color={colors.text} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={16} color={colors.text} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={16} color={colors.primary} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {getStatusIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});