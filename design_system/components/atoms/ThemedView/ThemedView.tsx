import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { themes } from '@/design_system/ui/tokens';

export type ThemedViewProps = ViewProps & {
  /** Color to be used in light mode */
  lightColor?: string;
  /** Color to be used in dark mode */
  darkColor?: string;
};

/**
 * ThemedView component applies theme-based background colors to a view.
 * It supports different color variants for customization based on the current theme.
 */
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

