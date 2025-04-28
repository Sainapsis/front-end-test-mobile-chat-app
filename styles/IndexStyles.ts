import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    newChatButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    listContainer: {
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
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
      backgroundColor: '#007AFF',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    createButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    createButtonIcon: {
      marginRight: 8,
    },
    disabledButton: {
      backgroundColor: '#CCCCCC',
    },
    createButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });
  

export default styles;

