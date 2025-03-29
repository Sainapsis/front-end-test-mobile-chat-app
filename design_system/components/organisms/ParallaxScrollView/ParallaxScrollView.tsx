import type { PropsWithChildren, ReactElement } from 'react';
import Animated from 'react-native-reanimated';
import { ThemedView } from '@/design_system/components/atoms';
import { styles } from './ParallaxScrollView.styles';
import { useParallaxScrollView } from '@/hooks/components/useParallaxScrollView';

type Props = PropsWithChildren<{
  /** Header image element to be displayed with parallax effect */
  headerImage: ReactElement;
  /** Background color for the header, with dark and light theme variants */
  headerBackgroundColor: { dark: string; light: string };
}>;

/**
 * ParallaxScrollView component creates a scrollable view with a parallax header effect.
 * The header image moves at a different speed than the content when scrolling.
 */
export function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const { colorScheme, scrollRef, bottom, headerAnimatedStyle } = useParallaxScrollView();

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}
