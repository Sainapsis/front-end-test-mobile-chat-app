import { Button, StyleSheet, Text, View, Platform } from 'react-native';
import { useNotifications } from 'custom-notifier';

export default function App() {
  const {
    hasPermission,
    isLoading,
    requestPermissions,
    showNotification,
    cancelAllNotifications,
  } = useNotifications();

  const handleShowNotification = async () => {
    const notificationId = await showNotification({
      title: 'Test Notification',
      body: 'This is a test notification',
      data: {
        screen: 'home',
      },
    });

    if (notificationId) {
      console.log('Notification shown with ID:', notificationId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Checking notification permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.permissionContainer}>
        <Text style={styles.statusText}>
          Permission Status: {hasPermission ? 'Granted' : 'Not Granted'}
        </Text>
        
        {hasPermission === false && (
          <>
            <Text style={styles.permissionText}>
              {Platform.select({
                ios: 'Please enable notifications in your device settings.',
                android: 'Notifications are not enabled. Please grant permission.',
                default: 'Notifications are not enabled.',
              })}
            </Text>
            <Button 
              title="Request Permissions" 
              onPress={requestPermissions} 
            />
          </>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <Button 
          title="Show Notification" 
          onPress={handleShowNotification}
          disabled={!hasPermission} 
        />
        
        <Button 
          title="Cancel All Notifications" 
          onPress={cancelAllNotifications}
          disabled={!hasPermission} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  permissionText: {
    marginBottom: 10,
    color: 'red',
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 20,
  },
});
