import { NativeModule, requireNativeModule } from 'expo';
import { NotificationOptions, CustomNotifierEvents } from './CustomNotifier.types';

declare class CustomNotifierModule extends NativeModule<CustomNotifierEvents> {
  requestPermissions(): Promise<boolean>;
  checkPermissions(): Promise<boolean>;
  showNotification(options: NotificationOptions): Promise<string>;
  cancelNotification(id: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CustomNotifierModule>('CustomNotifier');
