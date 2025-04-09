import { requireNativeModule, NativeModule } from 'expo-modules-core';
import { CustomNotifierEvents } from './CustomNotifier.types';
// CustomNotifierEvents is implicitly used by the hook/listeners, no need to import here unless explicitly constraining

// Interface for the subscription object returned by addListener
interface NativeModuleSubscription {
  remove: () => void;
}

// Declare the interface for the native module
interface CustomNotifierNativeModule {
  hello(): string;
  requestPermissions(): Promise<boolean>;
  checkPermissions(): Promise<boolean>;
  getFcmToken(): Promise<string>;
  // Correctly typed addListener and removeListeners
  addListener<EventName extends keyof CustomNotifierEvents>(
    eventName: EventName,
    listener: CustomNotifierEvents[EventName]
  ): NativeModuleSubscription; // Use the defined interface for the return type
  removeListeners(count: number): void;
}

// Require the actual native module using its registered name
const CustomNotifierModule = requireNativeModule<CustomNotifierNativeModule>('CustomNotifier');

export default CustomNotifierModule;
