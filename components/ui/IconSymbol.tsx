// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

export type IconName = keyof typeof Ionicons.glyphMap;

export interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

/**
 * Componente universal para iconos que utiliza Ionicons.
 * Permite usar cualquier icono disponible en la librería Ionicons.
 *
 * @example
 * ```tsx
 * <IconSymbol name="checkmark" size={24} color="#000000" />
 * ```
 *
 * @see https://ionic.io/ionicons para ver todos los iconos disponibles
 */
export function IconSymbol({
  name,
  size = 24,
  color = '#000000',
  style
}: IconSymbolProps) {
  const baseStyle = Platform.select({
    ios: { transform: [{ scale: 1.2 }] },
    default: {}
  });

  return (
    <Ionicons
      name={name}
      size={size}
      color={color}
      style={[baseStyle, style]}
    />
  );
}
