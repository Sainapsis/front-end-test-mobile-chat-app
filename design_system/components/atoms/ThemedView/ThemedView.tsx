import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { themes } from '@/design_system/ui/tokens';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  backgroundVariant = "main",
  ...otherProps
}: ThemedViewProps & { backgroundVariant?: keyof typeof themes.light.background }) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
    backgroundVariant
  );

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

