import {
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
} from 'expo/config-plugins';

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
    color = '#ffffff',
    channelId = 'custom_notifier_channel',
    channelName = 'Custom Notifications',
    channelDescription = 'Channel for custom notifications',
  } = props;

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    const androidManifest = config.modResults;
    if (!androidManifest.manifest) {
      androidManifest.manifest = {};
    }
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.VIBRATE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.WAKE_LOCK',
      'android.permission.SCHEDULE_EXACT_ALARM',
    ];

    permissions.forEach(permission => {
      const exists = androidManifest.manifest['uses-permission'].some(
        (p: any) => p.$['android:name'] === permission
      );

      if (!exists) {
        androidManifest.manifest['uses-permission'].push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.default_notification_icon',
      icon
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.default_notification_color',
      color
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.notification_channel_id',
      channelId
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.notification_channel_name',
      channelName
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.notification_channel_description',
      channelDescription
    );

    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults.UIBackgroundModes = [
      'remote-notification'
    ];
    return config;
  });

  return config;
};

export default withCustomNotifier; 