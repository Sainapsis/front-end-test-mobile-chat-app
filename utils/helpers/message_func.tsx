import { ThemeColors } from '@/constants/Colors';
import { MessageStatus } from '@/database/interface/message';
import { Text } from 'react-native';

export const messageFunc = {
  getMessageStatusIcon(status: string, isCurrentUser?: boolean) {
    if (!isCurrentUser) return null;

    switch (status) {
      case MessageStatus.SENT:
        return <Text>✓</Text>;
      case MessageStatus.DELIVERED:
        return <Text>✓✓</Text>;
      case MessageStatus.READ:
        return <Text style={{ color: ThemeColors.blue }}>✓✓</Text>;
      default:
        return null;
    }
  }
};