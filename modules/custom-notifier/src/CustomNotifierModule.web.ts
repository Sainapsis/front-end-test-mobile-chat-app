import { registerWebModule, NativeModule } from 'expo';

import { CustomNotifierModuleEvents } from './CustomNotifier.types';

class CustomNotifierModule extends NativeModule<CustomNotifierModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(CustomNotifierModule);
