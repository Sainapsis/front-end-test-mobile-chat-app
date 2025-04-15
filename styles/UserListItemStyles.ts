import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E1E1E1',
    },
    selectedContainer: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
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

export default styles;