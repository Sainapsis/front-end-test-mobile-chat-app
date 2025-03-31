import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export const useTheme = () => {
  const colorScheme = useColorScheme() as Theme;
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    theme: colorScheme,
    colors: {
      background: isDark ? '#000000' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#000000',
      bubble: isDark ? '#1C1C1E' : '#E8E8E8',
      ownBubble: isDark ? '#0A84FF' : '#007AFF',
      reactionBackground: isDark ? '#2C2C2E' : '#F2F2F7',
      reactionText: isDark ? '#FFFFFF' : '#000000',
      reactionCount: isDark ? '#8E8E93' : '#8E8E93',
      userReactedBackground: isDark ? '#0A84FF' : '#E3F2FD',
      userReactedText: isDark ? '#FFFFFF' : '#007AFF',
      editInputBackground: isDark ? 'rgba(250, 241, 241, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      editInputText: isDark ? '#FFFFFF' : '#000000',
      editInputPlaceholder: isDark ? 'rgba(255, 255, 255, 0.5)' : '#8E8E93',
      modalOverlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
      modalBackground: isDark ? '#1C1C1E' : '#FFFFFF',
      border: isDark ? '#38383A' : '#E1E1E1',
    },
  };
}; 