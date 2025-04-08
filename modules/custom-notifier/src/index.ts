// Reexport the native module. On web, it will be resolved to CustomNotifierModule.web.ts
// and on native platforms to CustomNotifierModule.ts
export { default } from './CustomNotifierModule';
export * from './CustomNotifier.types';
export { useNotifications } from './useNotifications';
