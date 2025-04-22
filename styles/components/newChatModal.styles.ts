import { StyleSheet } from 'react-native';

export const newChatModalStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: 10,
      padding: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalSubtitle: {
      marginBottom: 10,
    },
    userList: {
      maxHeight: 400,
    },
    createButton: {
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    disabledButton: {
      backgroundColor: '#CCCCCC',
    },
    createButtonText: {
      fontWeight: 'bold',
    },
}); 