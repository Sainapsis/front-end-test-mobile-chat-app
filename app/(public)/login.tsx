import React from 'react';
import { StyleSheet, FlatList, SafeAreaView, Pressable, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppContext } from '@/hooks/AppContext';
import LoginList from '@/components/login/LoginList';
import LoginForm from '@/components/login/LoginForm';
import { ThemedView } from '@/components/ui/layout/ThemedView';
import { ThemedText } from '@/components/ui/text/ThemedText';

export default function LoginScreen() {
  const { users, login } = useAppContext();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <Pressable onPress={Keyboard.dismiss}>
        <ThemedView style={styles.loginContainer}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Welcome to Chat App</ThemedText>
          </ThemedView>
          {/* <LoginList></LoginList> */}
          <LoginForm></LoginForm>
        </ThemedView>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loginContainer: {
    justifyContent: 'center',
    height: '100%'
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
}); 