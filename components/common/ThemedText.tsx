import { Text, type TextProps } from 'react-native';
import { themedTextStyles } from '@/styles/common/themedText.styles';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? themedTextStyles.default : undefined,
        type === 'title' ? themedTextStyles.title : undefined,
        type === 'defaultSemiBold' ? themedTextStyles.defaultSemiBold : undefined,
        type === 'subtitle' ? themedTextStyles.subtitle : undefined,
        type === 'link' ? themedTextStyles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}


