import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLoadingState } from '@/hooks/useLoadingState';
import { TabIcon, getTabScreenOptions } from '@/design_system/components/molecules';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const { isLoading } = useLoadingState();

  const screenOptions = getTabScreenOptions({ colorScheme, isLoading });

  return (
    <Tabs screenOptions={{
      ...screenOptions,
      tabBarStyle: {
        position: 'absolute' as const,
        opacity: screenOptions.tabBarStyle.opacity
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="message.fill" 
              color={color}
              isLoading={isLoading}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon 
              name="person.fill" 
              color={color}
              isLoading={isLoading}
            />
          ),
        }}
      />
    </Tabs>
  );
}
