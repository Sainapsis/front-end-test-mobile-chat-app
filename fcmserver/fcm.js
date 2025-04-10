const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Inicializa Firebase Admin con tu service account
const serviceAccount = require(path.join(__dirname, 'service-account.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function sendSilentPush() {
  const message = {
    token: process.env.FCM_DEVICE_TOKEN,
    data: {
      silent: "true",
      type: 'SILENT_PUSH',
      message: 'Esto es una notificación silenciosa',
      timestamp: `${Date.now()}`,
      userId: '1',
    },
    android: {
      priority: 'high',
      notification: {
        priority: 'high',
        channelId: 'default',
      },
    },
    apns: {
      headers: {
        'apns-priority': '5',
      },
      payload: {
        aps: {
          'content-available': 1,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notificación silenciosa enviada con éxito:', response);
  } catch (error) {
    console.error('❌ Error al enviar la notificación silenciosa:', error);
  }
}

sendSilentPush();
