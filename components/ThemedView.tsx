import React from 'react';
import { View, ViewStyle, useColorScheme, ViewProps } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedViewProps extends ViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  darkBackgroundColor?: string;
  lightBackgroundColor?: string;
}

export function ThemedView({
  children,
  style,
  darkBackgroundColor,
  lightBackgroundColor,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Usar colores personalizados si se proporcionan, de lo contrario usar los del tema
  const backgroundColor = colorScheme === 'dark'
    ? darkBackgroundColor || theme.background
    : lightBackgroundColor || theme.background;

  return (
    <View
      style={[
        {
          backgroundColor,
        },
        style
      ]}
      {...otherProps}
    >
      {children}
    </View>
  );
}
