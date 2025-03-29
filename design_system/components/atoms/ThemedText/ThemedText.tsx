import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { themes } from '@/design_system/ui/tokens';
import { styles } from './ThemedText.styles';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  textVariant?: keyof typeof themes.light.text;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

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
        style, // Mantiene estilos personalizados
      ]}
      {...rest}
    />
  );
}
