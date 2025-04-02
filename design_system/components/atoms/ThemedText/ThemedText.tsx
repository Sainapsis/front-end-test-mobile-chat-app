import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { themes } from '@/design_system/ui/tokens';
import { styles } from './ThemedText.styles';

export type ThemedTextProps = TextProps & {
  /** Color to be used in light mode */
  lightColor?: string;
  /** Color to be used in dark mode */
  darkColor?: string;
  /** Variant of the text color based on theme */
  textVariant?: keyof typeof themes.light.text;
  /** Type of text style to apply */
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

/**
 * ThemedText component applies theme-based colors and styles to text.
 * It supports different color variants and text types for customization.
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  textVariant = 'primary',
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text',
    textVariant
  );

  return (
    <Text
      style={[
        { color },
        styles[type],
        style, // Maintains custom styles
      ]}
      {...rest}
    />
  );
}
