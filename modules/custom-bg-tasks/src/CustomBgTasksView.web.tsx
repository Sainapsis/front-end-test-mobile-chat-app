import * as React from 'react';

import { CustomBgTasksViewProps } from './CustomBgTasks.types';

export default function CustomBgTasksView(props: CustomBgTasksViewProps) {
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
