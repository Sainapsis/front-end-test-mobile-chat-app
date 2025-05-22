import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '85%',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    gap: 4,
  },
  selfBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  selfMessageText: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
});

export default styles;