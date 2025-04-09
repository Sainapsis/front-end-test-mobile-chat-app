import type { StyleProp, ViewStyle } from 'react-native';

export type ChangeEventPayload = {
  value: string;
};

// Type for the data payload within an FCM message
export type FcmDataPayload = Record<string, any>; // Can be more specific if data structure is known

// Type for the notification part of an FCM message (optional)
export interface FcmNotificationPayload {
  title?: string;
  body?: string;
  // Add other relevant notification fields if needed (e.g., image, sound)
}

// Event payload when a notification is received
export interface NotificationReceivedEvent {
  messageId?: string; // Optional: Firebase message ID
  data: FcmDataPayload;
  notification?: FcmNotificationPayload; // Present for notification messages or foreground notifications shown by service
  // Add other relevant fields like sentTime if provided by native module
}

// Event payload when a notification is opened by the user
export interface NotificationOpenedEvent {
  messageId?: string;
  data: FcmDataPayload;
  notification?: FcmNotificationPayload;
  action?: string; // Optional: If notification actions are implemented
}

// Event payload when the FCM token is refreshed
export interface TokenRefreshEvent {
  token: string;
}

// Interface defining the events emitted by the native module
export interface CustomNotifierEvents {
  [key: string]: (...args: any[]) => void; // Index signature for compatibility
  onNotificationReceived: (event: NotificationReceivedEvent) => void;
  onNotificationOpened: (event: NotificationOpenedEvent) => void;
  onTokenRefreshed: (event: TokenRefreshEvent) => void;
  // Removed onChange? to satisfy index signature
}
