import { Platform } from 'react-native';
import { HapticTab } from '@/design_system/components/molecules';
import TabBarBackground from '@/design_system/ui/vendors/TabBarBackground';
import { colors } from '@/design_system/ui/tokens';

interface TabScreenOptionsProps {
  colorScheme: 'light' | 'dark';
  isLoading: boolean;
}

export const getTabScreenOptions = ({ colorScheme, isLoading }: TabScreenOptionsProps) => ({
  tabBarActiveTintColor: colors[colorScheme].tint,
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