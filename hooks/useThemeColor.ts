/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { themes } from '@/design_system/ui/tokens/colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Custom hook for retrieving theme-specific colors
 * @param colors - Optional object with light and dark color overrides
 * @param colorName - Name of the color to retrieve from the theme
 * @param variant - Optional variant for colors that have multiple values
 * @returns The appropriate color value based on the current theme
 */
export function useThemeColor(
  colors: { light?: string; dark?: string },
  colorName: keyof typeof themes.light & keyof typeof themes.dark,
  variant?: keyof typeof themes.light.text | keyof typeof themes.light.background
) {
  const theme = useColorScheme() ?? "light";
  const colorValue = themes[theme][colorName];

  if (typeof colorValue === "object" && variant && variant in colorValue) {
    return colorValue[variant as keyof typeof colorValue];
  }

  return typeof colorValue === "string" ? colorValue : "#000000";
}

