import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { RelativePathString, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { DrizzleStudioDevTool } from "@/src/infrastructure/DrizzleStudio";
import { Routes } from "@/src/presentation/constants/Routes";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useColorScheme } from "react-native";
import { AppProvider } from "@/src/presentation/context/app-context/AppProvider";
import { UserProvider } from "@/src/presentation/context/user-context/UserProvider";
import { ChatProvider } from "@/src/presentation/context/chat-context/ChatProvider";
import { AuthProvider } from "@/src/presentation/context/auth-context/AuthProvider";

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { currentUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === Routes.LOGIN;

    if (!currentUser && !inAuthGroup) {
      router.replace(`/${Routes.LOGIN}` as RelativePathString);
    } else if (currentUser && inAuthGroup) {
      router.replace(`/${Routes.TABS}` as RelativePathString);
    }
  }, [currentUser]);
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <>
      <Stack>
        <Stack.Screen name={Routes.TABS} options={{ headerShown: false }} />
        <Stack.Screen
          name={Routes.LOGIN}
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name={Routes.CHATROOM}
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name={Routes.NOTFOUND} />
      </Stack>
      {__DEV__ && <DrizzleStudioDevTool />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <AuthProvider>
          <UserProvider>
            <ChatProvider>
              {/* <ChatRoomProvider> */}
              <StatusBar style="auto" />
              <RootLayoutNav />
              {/* </ChatRoomProvider> */}
            </ChatProvider>
          </UserProvider>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
