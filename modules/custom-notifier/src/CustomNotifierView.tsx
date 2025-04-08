import { requireNativeView } from 'expo';
import * as React from 'react';

import { CustomNotifierViewProps } from './CustomNotifier.types';

const NativeView: React.ComponentType<CustomNotifierViewProps> =
  requireNativeView('CustomNotifier');

export default function CustomNotifierView(props: CustomNotifierViewProps) {
  return <NativeView {...props} />;
}
