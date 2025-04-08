import {
  ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
  AndroidConfig,
} from 'expo/config-plugins';

interface CustomNotifierPluginProps {
  notificationIcon?: string;
  notificationColor?: string;
  notificationChannelId?: string;
  notificationChannelName?: string;
  notificationChannelDescription?: string;
}

const withCustomNotifier: ConfigPlugin<CustomNotifierPluginProps> = (
  config,
  props = {}
) => {
  const {
    notificationIcon = 'notification_icon',
    notificationColor = '#ffffff',
    notificationChannelId = 'custom_notifier_channel',
    notificationChannelName = 'Custom Notifier Channel',
    notificationChannelDescription = 'Channel for custom notifications',
  } = props;

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.notification_icon',
      notificationIcon
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.notification_color',
      notificationColor
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.channel_id',
      notificationChannelId
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.channel_name',
      notificationChannelName
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'expo.modules.customnotifier.channel_description',
      notificationChannelDescription
    );

    return config;
  });

  config = withInfoPlist(config, (config) => {
    config.modResults['CustomNotifierIcon'] = notificationIcon;
    config.modResults['CustomNotifierColor'] = notificationColor;
    config.modResults['CustomNotifierChannelId'] = notificationChannelId;
    config.modResults['CustomNotifierChannelName'] = notificationChannelName;
    config.modResults['CustomNotifierChannelDescription'] = notificationChannelDescription;
    return config;
  });

  return config;
};

export default withCustomNotifier; 