import { EventEmitter } from 'expo-modules-core';

import { BackgroundTaskOptions, CustomBgTasksModuleEvents } from './CustomBgTasks.types';

// Definir el tipo completo para el módulo web
interface CustomBgTasksWebModule extends EventEmitter {
  PI: number;
  hello: () => string;
  setValueAsync: (value: string) => Promise<void>;
  executeJsInBackground: (options: BackgroundTaskOptions) => Promise<string>;
  registerSilentNotificationHandler: () => Promise<void>;
  unregisterSilentNotificationHandler: () => Promise<void>;
  isBackgroundTaskRunning: (taskId: string) => Promise<boolean>;
  stopBackgroundTask: (taskId: string) => Promise<boolean>;
}

// Crear un mock del módulo nativo para el entorno web
const mockNativeModule = {
  name: 'CustomBgTasks',
  methodsAddedAfterInit: new Set(),
};

// Ensure the module is properly initialized at load time
console.log('[CustomBgTasks.web] Initializing web module...');

// Create the module with proper prototype chain to ensure all methods are available
const CustomBgTasksModule = new EventEmitter(mockNativeModule as any) as CustomBgTasksWebModule;

// Initialize all properties to ensure they exist
CustomBgTasksModule.PI = Math.PI;

CustomBgTasksModule.hello = () => {
  console.log('[CustomBgTasks.web] Hello method called');
  return 'Hello from the web platform!';
};

CustomBgTasksModule.setValueAsync = (value: string) => {
  console.log('[CustomBgTasks.web] setValueAsync called with:', value);
  CustomBgTasksModule.emit('onChange', { value });
  return Promise.resolve();
};

// Implementar métodos para tareas en segundo plano en web (simulados)
CustomBgTasksModule.executeJsInBackground = async (options: BackgroundTaskOptions) => {
  console.log('[CustomBgTasks.web] executeJsInBackground called with:', options);
  
  try {
    // En web, evaluamos directamente el código JS
    const result = new Function(`return (async () => { ${options.jsCode} })()`)();
    
    setTimeout(() => {
      CustomBgTasksModule.emit('onBackgroundTaskCompleted', {
        taskId: options.taskId,
        success: true,
        result
      });
    }, 500);
    
    return options.taskId;
  } catch (error) {
    setTimeout(() => {
      CustomBgTasksModule.emit('onBackgroundTaskCompleted', {
        taskId: options.taskId,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }, 500);
    
    return options.taskId;
  }
};

CustomBgTasksModule.registerSilentNotificationHandler = async () => {
  console.log('[CustomBgTasks.web] Silent notifications not supported in web');
  return Promise.resolve();
};

CustomBgTasksModule.unregisterSilentNotificationHandler = async () => {
  console.log('[CustomBgTasks.web] unregisterSilentNotificationHandler called');
  return Promise.resolve();
};

CustomBgTasksModule.isBackgroundTaskRunning = async (taskId: string) => {
  console.log('[CustomBgTasks.web] isBackgroundTaskRunning called with:', taskId);
  return Promise.resolve(false);
};

CustomBgTasksModule.stopBackgroundTask = async (taskId: string) => {
  console.log('[CustomBgTasks.web] stopBackgroundTask called with:', taskId);
  return Promise.resolve(false);
};

console.log('[CustomBgTasks.web] Web module initialized successfully with methods:', 
  Object.getOwnPropertyNames(CustomBgTasksModule)
    .filter(prop => typeof (CustomBgTasksModule as any)[prop] === 'function')
    .join(', ')
);

export default CustomBgTasksModule;
