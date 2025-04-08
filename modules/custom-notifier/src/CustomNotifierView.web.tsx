import * as React from 'react';

import { CustomNotifierViewProps } from './CustomNotifier.types';

export default function CustomNotifierView(props: CustomNotifierViewProps) {
  const handleLoad = () => {
    if (props.onLoad) {
      props.onLoad({ nativeEvent: { url: props.url } });
    }
  };

  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={handleLoad}
      />
    </div>
  );
}
