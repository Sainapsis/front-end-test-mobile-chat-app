import { ThemeColors } from '@/constants/Colors';
import { MessageStatus } from '@/src/domain/entities/message';
import { Text } from 'react-native';

export const messageFunc = {
  getMessageStatusIcon(status: string, isCurrentUser?: boolean) {
    if (!isCurrentUser) return null;

    switch (status) {
      case MessageStatus.Sent:
        return <Text>✓</Text>;
      case MessageStatus.Delivered:
        return <Text>✓✓</Text>;
      case MessageStatus.Read:
        return <Text style={{ color: ThemeColors.blue }}>✓✓</Text>;
      default:
        return null;
    }
  }
};