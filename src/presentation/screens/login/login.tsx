import React from "react";
import { FlatList, SafeAreaView } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextType, ThemedText } from "@/src/presentation/components/ThemedText";
import { ThemedView } from "@/src/presentation/components/ThemedView";
import { UserListItem } from "@/src/presentation/components/UserListItem";
import styles from "@/src/presentation/screens/login/login.style";
import { Routes } from "@/src/presentation/constants/Routes";
import { useAppContext } from '@/src/presentation/hooks/AppContext';

export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  const handleUserSelect = async (userId: string) => {
    const user = await login({ userId });

    if (user) {
      router.replace(`/${Routes.TABS}` as RelativePathString);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type={TextType.TITLE}>Welcome to Chat App</ThemedText>
          <ThemedText style={styles.subtitle}>
            Select a user to continue
          </ThemedText>
        </ThemedView>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onSelect={() => handleUserSelect(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
