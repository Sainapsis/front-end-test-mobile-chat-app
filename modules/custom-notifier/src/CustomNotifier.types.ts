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

export type CustomNotifierViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationEvent {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface CustomNotifierEvents {
  [key: string]: (event: NotificationEvent) => void;
  onNotificationReceived: (event: NotificationEvent) => void;
  onNotificationPressed: (event: NotificationEvent) => void;
}
