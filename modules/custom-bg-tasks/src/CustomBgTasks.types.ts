import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type CustomBgTasksModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onBackgroundTaskCompleted: (params: BackgroundTaskResult) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type BackgroundTaskResult = {
  taskId: string;
  success: boolean;
  result?: any;
  error?: string;
};

export type BackgroundTaskOptions = {
  taskId: string;
  jsCode: string;
  timeout?: number;
  persistence?: boolean;
};

export type CustomBgTasksViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
