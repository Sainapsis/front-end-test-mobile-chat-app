import React from 'react';
import { StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import { ThemedText } from '@/components/ui/text/ThemedText';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { UserListItem } from '@/components/users/UserListItem';
import LoginList from '@/components/login/LoginList';

export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <LoginList></LoginList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
}); 