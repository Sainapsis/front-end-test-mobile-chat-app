// Reexport the native module. On web, it will be resolved to CustomNotifierModule.web.ts
// and on native platforms to CustomNotifierModule.ts
export { default } from './CustomNotifierModule';
export { default as CustomNotifierView } from './CustomNotifierView';
export * from  './CustomNotifier.types';
