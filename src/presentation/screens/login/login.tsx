import React from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";
import { RelativePathString, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TextType, ThemedText } from "@/src/presentation/components/ThemedText";
import { ThemedView } from "@/src/presentation/components/ThemedView";
import { UserListItem } from "@/src/presentation/components/UserListItem";
import styles from "@/src/presentation/screens/login/login.style";
import { Routes } from "@/src/presentation/constants/Routes";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../hooks/useUser";

export default function LoginScreen() {
  const { login } = useAuth();
  const { loading, users, handleLoadMoreUsers } = useUser();
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
          data={loading ? [] : users}
          keyExtractor={(item) => item.id}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews
          onEndReached={async () =>
            users.length >= 10 && (await handleLoadMoreUsers())
          }
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              onSelect={() => handleUserSelect(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={() =>
            loading ? (
              <ThemedView>
                <ActivityIndicator />
              </ThemedView>
            ) : null
          }
          ListEmptyComponent={() =>
            !loading && (
              <ThemedView style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No users found. Please try again later.
                </ThemedText>
              </ThemedView>
            )
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}
