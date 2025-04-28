import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    text: {
      marginTop: 10,
      fontSize: 16,
    },
    errorText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'red',
      marginBottom: 10,
    },
    errorMessage: {
      fontSize: 14,
      color: 'red',
      textAlign: 'center',
    },
  }); 

export default styles;
