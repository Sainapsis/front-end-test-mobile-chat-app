import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLoadingState } from '@/hooks/useLoadingState'; // Add this import

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useLoadingState(); // Add loading state

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            opacity: isLoading ? 0.5 : 1, // Add opacity when loading
          },
          default: {
            opacity: isLoading ? 0.5 : 1, // Add opacity when loading
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={28} 
              name="message.fill" 
              color={color}
              style={{ opacity: isLoading ? 0.5 : 1 }} // Add opacity to icon
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={28} 
              name="person.fill" 
              color={color}
              style={{ opacity: isLoading ? 0.5 : 1 }} // Add opacity to icon
            />
          ),
        }}
      />
    </Tabs>
  );
}
