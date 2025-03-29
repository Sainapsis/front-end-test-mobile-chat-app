import Animated, {
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
  } from 'react-native-reanimated';
import { useBottomTabOverflow } from '@/design_system/ui/vendors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { parallaxAnimation } from '@/design_system/components/organisms/ParallaxScrollView/ParallaxScrollView.styles';

/**
 * Custom hook for handling parallax scroll view effects
 * @returns Object containing color scheme, scroll reference, bottom overflow, and animated header style
 */
export function useParallaxScrollView() {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => 
    parallaxAnimation.header(scrollOffset)
  );

  return { colorScheme, scrollRef, bottom, headerAnimatedStyle };
}