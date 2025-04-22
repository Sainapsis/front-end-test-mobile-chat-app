import { Platform } from 'react-native';
import { HapticTab } from '@/design_system/components/molecules/HapticTab';
import TabBarBackground from '@/design_system/ui/vendors/TabBarBackground';
import { themes } from '@/design_system/ui/tokens';
import { Theme } from '@/types/tColores';

interface TabScreenOptionsProps {
  /** Current color scheme (light/dark) */
  colorScheme: Theme;
  /** Whether the tab bar is in a loading state */
  isLoading: boolean;
}

/**
 * getTabScreenOptions function returns configuration options for tab screens.
 * It handles styling, haptic feedback, and loading states for the tab bar.
 */
export const getTabScreenOptions = ({ colorScheme, isLoading }: TabScreenOptionsProps) => ({
  tabBarActiveTintColor: themes[colorScheme].tint,
  headerShown: false,
  tabBarButton: HapticTab,
  tabBarBackground: TabBarBackground,
  tabBarStyle: Platform.select({
    ios: {
      position: 'absolute',
      opacity: isLoading ? 0.5 : 1,
    },
    default: {
      opacity: isLoading ? 0.5 : 1,
    },
  }),
});