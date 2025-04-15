import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: 'white',
        fontWeight: 'bold',
    },
    statusIndicator: {
        position: 'absolute',
        borderWidth: 1.5,
        borderColor: 'white',
    },
});

export default styles;
