import { StyleSheet } from 'react-native';

export const messageStatusStyles = StyleSheet.create({
    container: {
      marginLeft: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    doubleCheckContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 16,
      height: 14,
    },
    firstCheck: {
      position: 'absolute',
      left: 0,
    },
    secondCheck: {
      position: 'absolute',
      left: 4,
    },
  });