import {
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
} from 'expo/config-plugins';

// Define a local type for the permission element structure
interface PermissionElement {
   $: { 'android:name': string; [key: string]: string | undefined };
}

interface CustomNotifierPluginProps {
  icon?: string;
  color?: string;
  channelId?: string;
  channelName?: string;
  channelDescription?: string;
}

const withCustomNotifier: ConfigPlugin<CustomNotifierPluginProps> = (
  config,
  props = {}
) => {
  const {
    icon = 'ic_notification',
    color = 'notification_color',
    channelId = 'default_notification_channel_id',
    channelName = 'Custom Notifications',
    channelDescription = 'Channel for custom notifications',
  } = props;

  config = withAndroidManifest(config, (config) => {
    let androidManifest = config.modResults;

    if (!androidManifest.manifest) {
      androidManifest.manifest = {
         $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
         permission: [],
         application: [],
         queries: [],
      };
    }

    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    const permissionsToAdd = [
      'android.permission.INTERNET',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
    ];

    const existingPermissions = androidManifest.manifest['uses-permission'] as PermissionElement[];

    permissionsToAdd.forEach(permission => {
      const exists = existingPermissions.some(
        (p) => p.$ && p.$['android:name'] === permission
      );

      if (!exists) {
        existingPermissions.push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      androidManifest
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.google.firebase.messaging.default_notification_icon',
      `@drawable/${icon}`,
      'resource'
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.google.firebase.messaging.default_notification_color',
      `@color/${color}`,
      'resource'
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.google.firebase.messaging.default_notification_channel_id',
      `@string/${channelId}`,
       'resource'
    );

    if (!mainApplication.service) {
       mainApplication.service = [];
     }
     const serviceName = '.MyFirebaseMessagingService';
     let serviceElement = mainApplication.service.find(s => s.$ && s.$['android:name'] === serviceName);
     if (!serviceElement) {
       serviceElement = {
         $: {
           'android:name': serviceName,
           'android:exported': 'false',
         },
         'intent-filter': [
           {
             action: [
               { $: { 'android:name': 'com.google.firebase.MESSAGING_EVENT' } }
             ]
           }
         ]
       };
       mainApplication.service.push(serviceElement);
     }

    return config;
  });

  config = withInfoPlist(config, (config) => {
    if (!config.modResults.UIBackgroundModes) {
        config.modResults.UIBackgroundModes = [];
    }
    if (!config.modResults.UIBackgroundModes.includes('remote-notification')) {
        config.modResults.UIBackgroundModes.push('remote-notification');
    }
    return config;
  });

  return config;
};

export default withCustomNotifier; 