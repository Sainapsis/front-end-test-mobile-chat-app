import { StyleSheet } from 'react-native';

export const userListItemStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 0.2,
    },
    selectedContainer: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderRadius: 10,
      marginBottom: 10,
  
    },
    infoContainer: {
      marginLeft: 12,
      flex: 1,
    },
    statusText: {
      fontSize: 14,
      color: '#8F8F8F',
      marginTop: 4,
    },
  }); 