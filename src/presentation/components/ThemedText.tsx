import { useThemeColor } from '@/src/presentation/hooks/useThemeColor';
import { Text, type TextProps, StyleSheet } from 'react-native';


export enum TextType {
  DEFAULT = 'default',
  TITLE = 'title',
  DEFAULT_SEMI_BOLD = 'defaultSemiBold',
  SUBTITLE = 'subtitle',
  LINK = 'link',
}

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextType;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = TextType.DEFAULT,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === TextType.DEFAULT ? styles.default : undefined,
        type === TextType.TITLE ? styles.title : undefined,
        type === TextType.DEFAULT_SEMI_BOLD ? styles.defaultSemiBold : undefined,
        type === TextType.SUBTITLE ? styles.subtitle : undefined,
        type === TextType.LINK ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
