import * as React from 'react';

import { CustomNotifierViewProps } from './CustomNotifier.types';

export default function CustomNotifierView(props: CustomNotifierViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
