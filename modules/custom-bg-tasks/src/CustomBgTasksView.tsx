import { requireNativeView } from 'expo';
import * as React from 'react';

import { CustomBgTasksViewProps } from './CustomBgTasks.types';

const NativeView: React.ComponentType<CustomBgTasksViewProps> =
  requireNativeView('CustomBgTasks');

export default function CustomBgTasksView(props: CustomBgTasksViewProps) {
  return <NativeView {...props} />;
}
