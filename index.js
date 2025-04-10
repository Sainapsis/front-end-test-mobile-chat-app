// // index.ts
// import { registerRootComponent } from 'expo';
// import { ExpoRoot } from 'expo-router';
// import messaging from '@react-native-firebase/messaging';
// import notifee from '@notifee/react-native';
// import { AppRegistry } from 'react-native';

// // 👇 Esto permite ejecución JS en background cuando llega una push silenciosa
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('📩 Silent push recibida en background:', remoteMessage);

//   const userId = remoteMessage.data?.userId;

//   if (userId) {
//     const updatedUser = {
//       id: userId,
//       modificationDate: new Date().toLocaleString(),
//     };
//     console.log('🧠 Actualización de usuario en background:', updatedUser);

//     // Aquí puedes usar tu función de base de datos o cualquier lógica
//     // await updateUserInDatabase(updatedUser); ← solo si no requiere acceso a UI
//   }
// });

// // 👇 Si usas notificaciones interactivas con notifee
AppRegistry.registerHeadlessTask('NotifeeBackgroundEvent', () =>
  notifee.onBackgroundEvent
);

// Register Firebase messaging headless task handler
AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => 
  async (remoteMessage) => {
    console.log('💤 Firebase Messaging Headless Task:', remoteMessage);
    if (remoteMessage?.data?.silent === 'true') {
      const userId = remoteMessage.data?.userId;
      if (userId) {
        console.log('🧠 Actualizando usuario en headless task:', userId);
        try {
          const updatedUser = {
            id: userId,
            modificationDate: new Date().toLocaleString(),
          };
          console.log('Usuario actualizado:', updatedUser);
        } catch (error) {
          console.error('Error actualizando usuario:', error);
        }
      }
    }
    return Promise.resolve();
  }
);

// // 👇 Renderiza la app con expo-router
// registerRootComponent(() => <ExpoRoot />);


import 'expo-router/entry';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';

async function handleSilentNotification(data) {
  console.log('Procesando notificación silenciosa en background:', data);
  
  if (data.actionType === 'SYNC_DATA') {
    console.log('Ejecutando sincronización desde tarea headless');
    try {
      // Implement your background data sync logic here
    } catch (error) {
      console.error('Error en tarea background:', error);
    }
  }
}

// Register handler for background messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Mensaje recibido en handler background:', remoteMessage);
  
  if (remoteMessage.data?.silent === 'true') {
    await handleSilentNotification(remoteMessage.data);
    return;
  }
  
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Nueva notificación',
    body: remoteMessage.notification?.body || '',
    data: remoteMessage.data,
  });
});

// Register handler for Notifee background events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    console.log('Notificación presionada en background');
  }
});

// Register Notifee headless task
AppRegistry.registerHeadlessTask('NotifeeBackgroundEvent', () =>
  notifee.onBackgroundEvent
);

// Register Firebase messaging headless task handler
AppRegistry.registerHeadlessTask(
  'ReactNativeFirebaseMessagingHeadlessTask', 
  () => async (remoteMessage) => {
    console.log('💤 Firebase Messaging Headless Task:', remoteMessage);
    
    try {
      if (remoteMessage?.data?.silent === 'true') {
        const userId = remoteMessage.data?.userId;
        if (userId) {
          console.log('🧠 Actualizando usuario en headless task:', userId);
          const updatedUser = {
            id: userId,
            modificationDate: new Date().toLocaleString(),
          };
          console.log('Usuario actualizado:', updatedUser);
          
          // Implement your database logic here
        }
      }
    } catch (error) {
      console.error('Error in headless task:', error);
    }
    
    return Promise.resolve();
  }
);