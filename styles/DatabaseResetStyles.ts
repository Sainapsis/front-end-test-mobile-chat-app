import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
    },
    card: {
      padding: 20,
      borderRadius: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    description: {
      fontSize: 14,
      marginBottom: 20,
      lineHeight: 20,
    },
    button: {
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      fontWeight: 'bold',
      fontSize: 16,
    },
  }); 

export default styles;