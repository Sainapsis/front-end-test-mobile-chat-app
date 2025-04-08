import { NativeModule, requireNativeModule } from 'expo';

import { CustomNotifierModuleEvents } from './CustomNotifier.types';

declare class CustomNotifierModule extends NativeModule<CustomNotifierModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CustomNotifierModule>('CustomNotifier');
