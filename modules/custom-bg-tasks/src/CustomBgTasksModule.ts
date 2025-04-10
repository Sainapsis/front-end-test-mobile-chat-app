import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';

import { BackgroundTaskOptions, CustomBgTasksModuleEvents } from './CustomBgTasks.types';

type CustomBgTasksType = {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  executeJsInBackground(options: BackgroundTaskOptions): Promise<string>;
  registerSilentNotificationHandler(): Promise<void>;
  unregisterSilentNotificationHandler(): Promise<void>;
  isBackgroundTaskRunning(taskId: string): Promise<boolean>;
  stopBackgroundTask(taskId: string): Promise<boolean>;
};

console.log('[CustomBgTasks] Initializing native module...');

let CustomBgTasks;

try {
  // Try to get the native module
  CustomBgTasks = NativeModulesProxy.CustomBgTasks as CustomBgTasksType & typeof EventEmitter;
  console.log('[CustomBgTasks] Native module initialized:', 
    CustomBgTasks ? 'success' : 'failed - module is undefined');
  
  if (CustomBgTasks) {
    console.log('[CustomBgTasks] Available methods:', 
      Object.getOwnPropertyNames(CustomBgTasks)
        .filter(prop => typeof (CustomBgTasks as any)[prop] === 'function')
        .join(', '));
  }
} catch (error) {
  console.error('[CustomBgTasks] Error initializing native module:', error);
  
  // Create a fallback module for testing
  CustomBgTasks = {
    PI: Math.PI,
    hello: () => 'Hello from fallback module!',
    setValueAsync: () => Promise.resolve(),
    executeJsInBackground: () => Promise.resolve('fallback-task-id'),
    registerSilentNotificationHandler: () => Promise.resolve(),
    unregisterSilentNotificationHandler: () => Promise.resolve(),
    isBackgroundTaskRunning: () => Promise.resolve(false),
    stopBackgroundTask: () => Promise.resolve(false),
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
    emit: () => {},
  } as any;
  
  console.log('[CustomBgTasks] Using fallback module due to initialization error');
}

export default CustomBgTasks;
