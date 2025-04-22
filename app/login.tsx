import React from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import { UserListItem } from '@/components/chat/UserListItem';
import { loginScreenStyles } from '@/styles/screens/loginScreen.styles';

export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  const handleUserSelect = async (userId: string) => {
    if (await login(userId)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={loginScreenStyles.safeArea}>
      <StatusBar style="auto" />
      <ThemedView style={loginScreenStyles.container}>
        <ThemedView style={loginScreenStyles.header}>
          <ThemedText type="title">Welcome to Chat App</ThemedText>
          <ThemedText style={loginScreenStyles.subtitle}>
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
          contentContainerStyle={loginScreenStyles.listContainer}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

