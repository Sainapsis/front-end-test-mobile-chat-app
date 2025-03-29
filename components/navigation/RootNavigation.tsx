import React from 'react';
import { Stack } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { RouteGuard } from './RouteGuard';
import { DrizzleStudioDevTool } from '@/database/DrizzleStudio';
import { View } from 'react-native';
import { commonStyles } from '@/design_system/ui/styles';

export const RootNavigation = () => {
  const { isLoggedIn, loading } = useAppContext();

  return (
    <View style={commonStyles.container}>
      <RouteGuard isLoggedIn={isLoggedIn} loading={loading} />
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false, 
            gestureEnabled: false 
          }} 
        />
        <Stack.Screen 
          name="ChatRoom" 
          options={{ headerShown: true }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            presentation: 'modal',
            headerShown: false 
          }} 
        />
      </Stack>
      {__DEV__ && <DrizzleStudioDevTool />}
    </View>
  );
};