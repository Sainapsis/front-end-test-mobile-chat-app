/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';

export const ThemeColors = {
  white: '#FFFFFF',
  gray: '#8F8F8F',
  blue: '#007AFF',
  black: '#000000',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: ThemeColors.white,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: ThemeColors.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: ThemeColors.white,
  },
};

export const UserStatusColors = {
  online: '#4CAF50',
  offline: '#9E9E9E',
  away: '#FFC107',
}
