import React from 'react';
import { Text, TextStyle, TextProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedTextProps extends TextProps {
  readonly children: React.ReactNode;
  readonly style?: TextStyle;
  readonly type?: 'title' | 'subtitle' | 'body' | 'caption' | 'defaultSemiBold' | 'default' | 'link';
}

export function ThemedText({ children, style, type = 'body', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const textStyles = {
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    body: {
      fontSize: 16,
      color: theme.text,
    },
    caption: {
      fontSize: 14,
      color: theme.text,
    },
    default: {
      fontSize: 16,
      color: theme.text,
    },
    defaultSemiBold: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    link: {
      fontSize: 16,
      color: theme.primary,
      textDecorationLine: 'underline',
    }
  };

  return (
    <Text style={[textStyles[type], style]} {...props}>
      {children}
    </Text>
  );
}
