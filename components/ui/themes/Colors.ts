/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const bridgeBlue = '#3d63c9';
const weTalkWhite = '#E0E0E0';
const weTalkBlack = "#11181C";
const weTalkDarkSilver = '#1E1E1E';
const weTalkLightSilver = '#2A2A2A';
const weTalkLightBlue = '#EEF6FF';

export const Colors = {
  light: {
    text: weTalkBlack,
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    button:{
      textPrimary: '#fff',
    },
    chatBubble: {
      backgroundSelf: weTalkLightBlue,
      backgroundOther:  '#fff',
    },
    badges:{
      secondary: '#D9D9D9'
    }
  },
  dark: {
    text: weTalkWhite,
    background: '#121212',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    button:{
      textPrimary: weTalkWhite,
    },
    chatBubble: {
      backgroundSelf: weTalkDarkSilver,
      backgroundOther: weTalkLightSilver,
    },
    badges:{
      secondary:'#3A3A3A'
    }
  },
  button:{
    background: bridgeBlue,
    border: bridgeBlue,
    textSecondary: bridgeBlue
  },
  badges: {
    primary: bridgeBlue,
  }
};
