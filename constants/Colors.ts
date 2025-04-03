/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#4A6FA5';
const tintColorDark = '#6D98D9';

export const Colors = {
  light: {
    text: '#333333',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#999999',
    tabIconSelected: tintColorLight,
    primary: '#4A6FA5',
    secondary: '#637B94',
    border: '#E5E5E5',
    card: '#FFFFFF',
    error: '#E57373',
    success: '#81C784',
    warning: '#FFD54F',
    messageBubble: '#F5F5F5',
    messageBubbleSent: '#E8F0FB',
    messageText: '#333333',
    messageTextSent: '#333333',
    inputBackground: '#F5F5F5',
    modalBackground: 'rgba(0, 0, 0, 0.4)',
    modalContent: '#FFFFFF',
    headerBackground: '#FFFFFF',
    headerText: '#333333',
    buttonBackground: '#4A6FA5',
    buttonText: '#FFFFFF',
    buttonDisabled: '#D9D9D9',
  },
  dark: {
    text: '#F0F0F0',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#BBBBBB',
    tabIconSelected: tintColorDark,
    primary: '#6D98D9',
    secondary: '#8BA6BF',
    border: '#3A3A3A',
    card: '#1E1E1E',
    error: '#EF9A9A',
    success: '#A5D6A7',
    warning: '#FFE082',
    messageBubble: '#2C2C2C',
    messageBubbleSent: '#374151',
    messageText: '#F0F0F0',
    messageTextSent: '#F0F0F0',
    inputBackground: '#2A2A2A',
    modalBackground: 'rgba(0, 0, 0, 0.7)',
    modalContent: '#1E1E1E',
    headerBackground: '#1E1E1E',
    headerText: '#F0F0F0',
    buttonBackground: '#6D98D9',
    buttonText: '#FFFFFF',
    buttonDisabled: '#3D3D3D',
  },
};
