import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type CustomNotifierModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export interface CustomNotifierViewProps {
  url: string;
  onLoad?: (event: { nativeEvent: OnLoadEventPayload }) => void;
}

export interface NotificationEvent {
  notificationId: string;
  data?: Record<string, any>;
  action?: string; // e.g., 'pressed', 'received'
}

export interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  isSilent?: boolean;
}

export interface CustomNotifierEvents {
  [key: string]: (...args: any[]) => void;
  onNotificationReceived: (event: NotificationEvent) => void;
  onNotificationPressed: (event: NotificationEvent) => void;
}
