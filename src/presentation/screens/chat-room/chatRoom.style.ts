import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 10, 
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#F9F9F9',
  },
  inputContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    backgroundColor: '#F9F9F9',
    marginLeft: 10,
  },
  sendButton: {
    marginLeft: 10,
    marginBottom: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollView: {
    paddingRight: 10,
  },
  scrollContent: {
    flexDirection: 'row'
  },
  imageContainer: {
    marginVertical: 10,
    marginRight: 10,
    width: 120,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 4,
  },
  image: {
    width: '100%',
    height: '100%'
  },
}); 

export default styles;