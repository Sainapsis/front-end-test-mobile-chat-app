import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  base: {
    flex: 0,
  },
});

export const getDividerStyle = (
  vertical: boolean | undefined,
  spacingProp: number | undefined,
  color: string
) => ({
  backgroundColor: color,
  ...(vertical 
    ? { width: 1, marginHorizontal: spacingProp } 
    : { height: 1, marginVertical: spacingProp }),
});