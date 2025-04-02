import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const colorScheme = useColorScheme() as Theme;
  const isDark = colorScheme === 'dark';

  const lightTheme = {
    background: '#FFFFFF',
    text: '#000000',
    bubble: '#918d8d4f',
    ownBubble: '#007AFF',
    reactionBackground: '#F0F0F0',
    reactionText: '#666666',
    reactionCount: '#999999',
    userReactedBackground: '#007AFF',
    userReactedText: '#FFFFFF',
    editInputBackground: '#F0F0F0',
    editInputText: '#000000',
    editInputPlaceholder: '#999999',
    border: '#E1E1E1',
    primary: '#007AFF',
  };

  const darkTheme = {
    background: '#1C1C1E',
    text: '#FFFFFF',
    bubble: '#2C2C2E',
    ownBubble: '#0A84FF',
    reactionBackground: '#2C2C2E',
    reactionText: '#FFFFFF',
    reactionCount: '#8E8E93',
    userReactedBackground: '#0A84FF',
    userReactedText: '#FFFFFF',
    editInputBackground: '#2C2C2E',
    editInputText: '#FFFFFF',
    editInputPlaceholder: '#8E8E93',
    border: '#38383A',
    primary: '#0A84FF',
  };

  return {
    isDark,
    theme: colorScheme,
    colors: isDark ? darkTheme : lightTheme,
  };
}; 