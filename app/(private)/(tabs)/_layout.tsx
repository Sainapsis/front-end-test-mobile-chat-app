import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/ui/interactions/HapticTab';
import { IconSymbol } from '@/components/ui/icons/IconSymbol';
import TabBarBackground from '@/components/tabs/TabBarBackground';
import { Colors } from '@/components/ui/themes/Colors';
import { useColorScheme } from '@/hooks/themes/useColorScheme';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedBadge } from '@/components/ui/badges/ThemedBadge';

export default function TabLayout() {
  // Retrieve the current color scheme (e.g., 'light' or 'dark')
  const colorScheme = useColorScheme();
  const { offline } = useAppContext();
  return (<>
    {offline && <ThemedView style={styles.offlineHeader}>
      <ThemedBadge text='Offline mode' type='primary'></ThemedBadge>
    </ThemedView>}
    <Tabs
      screenOptions={{
        // Set the active tint color based on the current color scheme
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false, // Hide the header for each screen
        tabBarButton: HapticTab, // Use a custom tab button that provides haptic feedback
        tabBarBackground: TabBarBackground, // Custom background for the tab bar
        tabBarStyle: Platform.select({
          ios: {
            // On iOS, use a transparent background so that the blur effect can be visible
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      {/* First tab: Chats */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
      {/* Second tab: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  </>
  );
}


const styles = StyleSheet.create({
  offlineHeader: {
    position: 'absolute',
    zIndex: 999,
    top: 50,
    alignSelf: 'center'
  }
})