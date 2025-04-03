// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';


// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

type IconName =
  | 'chevron-left'
  | 'arrow-upward'
  | 'add'
  | 'close'
  | 'photo'
  | 'cancel'
  | 'people'
  | 'check'
  | 'message'
  | 'person';

interface IconSymbolProps {
  readonly name: IconName;
  readonly size?: number;
  readonly color?: string;
}

const iconMap: Record<IconName, keyof typeof MaterialIcons.glyphMap> = {
  'chevron-left': 'chevron-left',
  'arrow-upward': 'arrow-upward',
  'add': 'add',
  'close': 'close',
  'photo': 'photo',
  'cancel': 'cancel',
  'people': 'people',
  'check': 'check',
  'message': 'message',
  'person': 'person',
};

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({ name, size = 24, color = '#000' }: IconSymbolProps) {
  return (
    <MaterialIcons
      name={iconMap[name]}
      size={size}
      color={color}
    />
  );
}
