import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
    position: 'relative',
  },
  selfContainer: {
    alignSelf: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  reactionButton: {
    padding: 6,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginTop: 4,
  },
  selfReactionButton: {
    alignSelf: 'flex-end',
  },
  otherReactionButton: {
    alignSelf: 'flex-start',
  },
  reactionIcon: {
    fontSize: 16,
  },
  reactionOption: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  currentReaction: {
    position: 'absolute',
    bottom: -8,
    borderRadius: 12,
    padding: 4,
    minWidth: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  selfReaction: {
    right: -8,
  },
  otherReaction: {
    left: -8,
  },
  editInput: {
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    minWidth: 100,
    width: '100%',
  },
  editedIndicator: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  editContainer: {
    width: '100%',
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  saveText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  cancelText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 10,
  },
  modalButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 10,
  },
  mediaContainer: {
    marginBottom: 8,
  },
  mediaPreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default styles;
