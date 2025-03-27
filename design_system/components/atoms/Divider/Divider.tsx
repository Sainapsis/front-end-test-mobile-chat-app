import React from 'react';
import { View } from 'react-native';
import { colors } from '@/design_system/ui/tokens';
import { styles, getDividerStyle } from './Divider.styles';

interface DividerProps {
  vertical?: boolean;
  spacing?: number;
  color?: string;
}

export function Divider({ 
  vertical, 
  spacing: spacingProp, 
  color = colors.neutral[200] 
}: DividerProps) {
  const dividerStyle = getDividerStyle(vertical, spacingProp, color);

  return <View style={[styles.base, dividerStyle]} />;
}