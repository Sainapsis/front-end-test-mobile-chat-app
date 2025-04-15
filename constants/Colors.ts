/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

const iconColorLight = '#687076';
const iconColorDark = '#9BA1A6';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: iconColorLight,
    tabIconDefault: iconColorLight,
    tabIconSelected: tintColorLight,
    border: '#CCCCCC',
    inputBackground: '#F7F7F7',
    placeholder: '#A1A1A1',
    selfBubble: '#DCF8C6',
    otherBubble: '#FFFFFF',
    bubbleText: '#000000',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: iconColorDark,
    tabIconDefault: iconColorDark,
    tabIconSelected: tintColorDark,
    border: '#2E2E2E',
    inputBackground: '#1F1F1F',
    placeholder: '#5A5A5A',
    selfBubble: '#235A4A',
    otherBubble: '#2A2C33',
    bubbleText: '#ECEDEE',
  },
};
