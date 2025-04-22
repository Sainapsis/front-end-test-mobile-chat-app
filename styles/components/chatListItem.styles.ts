import { StyleSheet } from 'react-native';

export  const chatListItemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  content: {
    marginLeft: 12,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
    marginRight: 4,
  },

});