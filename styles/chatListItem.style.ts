import { ThemeColors } from '@/constants/Colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E1E1E1',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: ThemeColors.gray,
  },
  lastMessage: {
    fontSize: 14,
    color: ThemeColors.gray,
    flex: 1,
  },
  currentUserMessage: {
    fontStyle: 'italic',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: ThemeColors.black,
  },
});

export default styles;