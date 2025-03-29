import { interpolate } from 'react-native-reanimated';

/** Height of the header for parallax effect */
export const HEADER_HEIGHT = 250;

/**
 * parallaxAnimation object provides animations for parallax scrolling effects.
 * It includes transformations for header elements during scroll.
 */
export const parallaxAnimation = {
  header: (scrollOffset: { value: number }) => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
        ),
      },
      {
        scale: interpolate(
          scrollOffset.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [2, 1, 1]
        ),
      },
    ],
  }),
};